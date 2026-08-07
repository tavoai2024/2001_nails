#import <AppKit/AppKit.h>
#import <CoreText/CoreText.h>

static void AppendPathElement(void *info, const CGPathElement *element) {
    NSMutableString *path = (__bridge NSMutableString *)info;
    CGPoint *points = element->points;
    switch (element->type) {
        case kCGPathElementMoveToPoint:
            [path appendFormat:@"M%.3f %.3f", points[0].x, points[0].y];
            break;
        case kCGPathElementAddLineToPoint:
            [path appendFormat:@"L%.3f %.3f", points[0].x, points[0].y];
            break;
        case kCGPathElementAddQuadCurveToPoint:
            [path appendFormat:@"Q%.3f %.3f %.3f %.3f",
                points[0].x, points[0].y, points[1].x, points[1].y];
            break;
        case kCGPathElementAddCurveToPoint:
            [path appendFormat:@"C%.3f %.3f %.3f %.3f %.3f %.3f",
                points[0].x, points[0].y, points[1].x, points[1].y,
                points[2].x, points[2].y];
            break;
        case kCGPathElementCloseSubpath:
            [path appendString:@"Z"];
            break;
    }
}

static NSString *EscapedXML(NSString *value) {
    return [[[[value stringByReplacingOccurrencesOfString:@"&" withString:@"&amp;"]
        stringByReplacingOccurrencesOfString:@"<" withString:@"&lt;"]
        stringByReplacingOccurrencesOfString:@">" withString:@"&gt;"]
        stringByReplacingOccurrencesOfString:@"\"" withString:@"&quot;"];
}

static NSString *OutlinedText(NSString *fontName, NSString *text, CGFloat fontSize,
                              CGFloat tracking, CGFloat centerX, CGFloat baseline,
                              NSString *fill) {
    CTFontRef font = CTFontCreateWithName((__bridge CFStringRef)fontName, fontSize, NULL);
    if (!font) {
        fprintf(stderr, "Unable to load font: %s\n", fontName.UTF8String);
        exit(2);
    }

    NSUInteger count = text.length;
    UniChar *characters = calloc(count, sizeof(UniChar));
    CGGlyph *glyphs = calloc(count, sizeof(CGGlyph));
    CGSize *advances = calloc(count, sizeof(CGSize));
    [text getCharacters:characters range:NSMakeRange(0, count)];
    if (!CTFontGetGlyphsForCharacters(font, characters, glyphs, count)) {
        fprintf(stderr, "Missing glyph in font %s for text %s\n",
                fontName.UTF8String, text.UTF8String);
        exit(3);
    }
    CTFontGetAdvancesForGlyphs(font, kCTFontOrientationHorizontal, glyphs, advances, count);

    CGFloat totalWidth = tracking * MAX((NSInteger)count - 1, 0);
    for (NSUInteger i = 0; i < count; i++) totalWidth += advances[i].width;
    CGFloat cursorX = centerX - totalWidth / 2.0;
    NSMutableString *result = [NSMutableString string];

    for (NSUInteger i = 0; i < count; i++) {
        CGPathRef glyphPath = CTFontCreatePathForGlyph(font, glyphs[i], NULL);
        if (glyphPath) {
            NSMutableString *data = [NSMutableString string];
            CGPathApply(glyphPath, (__bridge void *)data, AppendPathElement);
            [result appendFormat:@"<path d=\"%@\" fill=\"%@\" transform=\"translate(%.3f %.3f) scale(1 -1)\"/>",
                data, fill, cursorX, baseline];
            CGPathRelease(glyphPath);
        }
        cursorX += advances[i].width + tracking;
    }

    free(characters);
    free(glyphs);
    free(advances);
    CFRelease(font);
    return result;
}

static NSString *SVGHeader(CGFloat width, CGFloat height, NSString *label) {
    return [NSString stringWithFormat:
        @"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"%.0f\" height=\"%.0f\" viewBox=\"0 0 %.0f %.0f\" role=\"img\" aria-label=\"%@\">",
        width, height, width, height, EscapedXML(label)];
}

static void WriteFile(NSString *path, NSString *content) {
    NSError *error = nil;
    if (![content writeToFile:path atomically:YES encoding:NSUTF8StringEncoding error:&error]) {
        fprintf(stderr, "Unable to write %s: %s\n", path.UTF8String,
                error.localizedDescription.UTF8String);
        exit(4);
    }
}

static void GenerateComparison(NSString *outputPath) {
    NSArray<NSDictionary *> *fonts = @[
        @{@"name": @"HoeflerText-Regular", @"label": @"Hoefler Text"},
        @{@"name": @"Cochin", @"label": @"Cochin Regular"},
        @{@"name": @"TimesNewRomanPSMT", @"label": @"Times New Roman"}
    ];
    NSMutableString *svg = [NSMutableString stringWithString:SVGHeader(1200, 900, @"2001 numeral font comparison")];
    [svg appendString:@"<rect width=\"1200\" height=\"900\" fill=\"#f3eee5\"/>"
                       "<text x=\"70\" y=\"72\" font-family=\"Helvetica Neue\" font-size=\"18\" letter-spacing=\"4\" fill=\"#b08b5b\">2001 NAILS / NUMERAL STUDY</text>"
                       "<text x=\"70\" y=\"116\" font-family=\"Helvetica Neue\" font-size=\"34\" font-weight=\"600\" fill=\"#302d28\">Narrow editorial candidates</text>"];
    for (NSUInteger i = 0; i < fonts.count; i++) {
        CGFloat y = 158 + i * 235;
        [svg appendFormat:@"<rect x=\"70\" y=\"%.0f\" width=\"1060\" height=\"205\" rx=\"22\" fill=\"#fffaf2\" stroke=\"#ded3c4\"/>", y];
        [svg appendString:OutlinedText(fonts[i][@"name"], @"2001", 168, -4, 385, y + 174, @"#4f5a42")];
        [svg appendFormat:@"<text x=\"720\" y=\"%.0f\" font-family=\"Helvetica Neue\" font-size=\"26\" font-weight=\"600\" fill=\"#302d28\">%@</text>", y + 84, fonts[i][@"label"]];
        [svg appendFormat:@"<text x=\"720\" y=\"%.0f\" font-family=\"Helvetica Neue\" font-size=\"16\" fill=\"#6d665c\">No flourishes · identical optical scale</text>", y + 118];
    }
    [svg appendString:@"</svg>"];
    WriteFile(outputPath, svg);
}

static NSString *BotanicalSprig(NSString *stroke, CGFloat x, CGFloat y, CGFloat scale) {
    return [NSString stringWithFormat:
        @"<g transform=\"translate(%.3f %.3f) scale(%.4f)\" fill=\"none\" stroke=\"%@\" stroke-linecap=\"round\" stroke-linejoin=\"round\">"
         "<path d=\"M18 138 C53 131 78 113 96 89 C119 59 143 32 184 14\" stroke-width=\"1.5\"/>"
         "<path d=\"M57 118 C79 114 103 104 127 94 C111 113 85 122 57 118 Z\" stroke-width=\"1.3\"/>"
         "<path d=\"M79 104 C66 82 70 61 83 45 C90 67 88 88 79 104 Z\" stroke-width=\"1.3\"/>"
         "<path d=\"M98 88 C121 80 144 70 163 63 C150 82 126 92 98 88 Z\" stroke-width=\"1.3\"/>"
         "<path d=\"M113 70 C103 47 109 24 123 9 C130 32 125 54 113 70 Z\" stroke-width=\"1.3\"/>"
         "<path d=\"M124 57 C145 41 166 25 186 15 C174 38 151 56 124 57 Z\" stroke-width=\"1.3\"/>"
         "</g>", x, y, scale, stroke];
}

static NSString *PrimaryMark(CGFloat centerX, CGFloat baseline, CGFloat scale,
                             NSString *wordColor, NSString *plantColor,
                             NSString *detailColor) {
    NSMutableString *mark = [NSMutableString string];
    CGFloat wordSize = 220 * scale;
    [mark appendString:BotanicalSprig(plantColor, centerX - 102 * scale,
                                      baseline - 355 * scale, 1.1 * scale)];
    [mark appendString:OutlinedText(@"Cochin", @"2001", wordSize,
                                    -4 * scale, centerX, baseline, wordColor)];
    [mark appendString:OutlinedText(@"Cochin", @"NAILS", 27 * scale,
                                    11 * scale, centerX, baseline + 88 * scale, detailColor)];
    [mark appendString:OutlinedText(@"Cochin", @"OF WOODBURY", 15 * scale,
                                    5 * scale, centerX, baseline + 128 * scale, detailColor)];
    return mark;
}

static void GeneratePrimary(NSString *outputPath) {
    NSMutableString *svg = [NSMutableString stringWithString:SVGHeader(1200, 640, @"2001 Nails of Woodbury primary logo")];
    [svg appendString:PrimaryMark(600, 390, 1.0, @"#4f5a42", @"#b08b5b", @"#302d28")];
    [svg appendString:@"</svg>"];
    WriteFile(outputPath, svg);
}

static void GenerateFavicon(NSString *outputPath) {
    NSMutableString *svg = [NSMutableString stringWithString:SVGHeader(256, 256, @"2001 Nails favicon")];
    [svg appendString:@"<rect width=\"256\" height=\"256\" rx=\"56\" fill=\"#4f5a42\"/>"];
    [svg appendString:BotanicalSprig(@"#d9c7aa", 86, 24, 0.45)];
    [svg appendString:OutlinedText(@"Cochin", @"2001", 61, -1.2, 128, 160, @"#fffaf2")];
    [svg appendString:OutlinedText(@"Cochin", @"NAILS", 12, 3.4, 128, 198, @"#fffaf2")];
    [svg appendString:@"</svg>"];
    WriteFile(outputPath, svg);
}

static void GenerateTransition(NSString *outputPath) {
    NSMutableString *svg = [NSMutableString stringWithString:SVGHeader(1200, 640, @"2001 Nails reverse transition logo")];
    [svg appendString:@"<rect width=\"1200\" height=\"640\" fill=\"#4f5a42\"/>"];
    [svg appendString:PrimaryMark(600, 390, 1.0, @"#fffaf2", @"#d9c7aa", @"#fffaf2")];
    [svg appendString:@"</svg>"];
    WriteFile(outputPath, svg);
}

static void GeneratePreview(NSString *outputPath) {
    NSMutableString *svg = [NSMutableString stringWithString:SVGHeader(1400, 1400, @"2001 Nails final logo system preview")];
    [svg appendString:@"<rect width=\"1400\" height=\"1400\" fill=\"#f3eee5\"/>"
                       "<text x=\"60\" y=\"62\" font-family=\"Helvetica Neue\" font-size=\"17\" letter-spacing=\"4\" fill=\"#b08b5b\">FINAL BOTANICAL LOGO SYSTEM</text>"
                       "<text x=\"60\" y=\"106\" font-family=\"Helvetica Neue\" font-size=\"34\" font-weight=\"600\" fill=\"#302d28\">2001 Nails of Woodbury</text>"
                       "<rect x=\"50\" y=\"150\" width=\"870\" height=\"1200\" rx=\"28\" fill=\"#fffaf2\" stroke=\"#ded3c4\"/>"
                       "<rect x=\"950\" y=\"150\" width=\"400\" height=\"560\" rx=\"26\" fill=\"#fffaf2\" stroke=\"#ded3c4\"/>"
                       "<rect x=\"950\" y=\"740\" width=\"400\" height=\"610\" rx=\"26\" fill=\"#4f5a42\"/>"];
    [svg appendString:PrimaryMark(485, 800, 0.95, @"#4f5a42", @"#b08b5b", @"#302d28")];
    [svg appendString:BotanicalSprig(@"#b08b5b", 1100, 230, 0.5)];
    [svg appendString:OutlinedText(@"Cochin", @"2001", 92, -1.8, 1150, 480, @"#4f5a42")];
    [svg appendString:OutlinedText(@"Cochin", @"NAILS", 16, 5, 1150, 528, @"#302d28")];
    [svg appendString:BotanicalSprig(@"#d9c7aa", 1100, 815, 0.5)];
    [svg appendString:OutlinedText(@"Cochin", @"2001", 92, -1.8, 1150, 1080, @"#fffaf2")];
    [svg appendString:OutlinedText(@"Cochin", @"NAILS", 16, 5, 1150, 1130, @"#fffaf2")];
    [svg appendString:OutlinedText(@"Cochin", @"OF WOODBURY", 11, 3.2, 1150, 1170, @"#d9c7aa")];
    [svg appendString:@"</svg>"];
    WriteFile(outputPath, svg);
}

static void GenerateLogoSystem(NSString *outputDirectory) {
    NSFileManager *fileManager = NSFileManager.defaultManager;
    NSError *error = nil;
    if (![fileManager createDirectoryAtPath:outputDirectory
                 withIntermediateDirectories:YES attributes:nil error:&error]) {
        fprintf(stderr, "Unable to create output directory: %s\n",
                error.localizedDescription.UTF8String);
        exit(5);
    }
    GeneratePrimary([outputDirectory stringByAppendingPathComponent:@"logo-primary.svg"]);
    GenerateFavicon([outputDirectory stringByAppendingPathComponent:@"logo-favicon.svg"]);
    GenerateTransition([outputDirectory stringByAppendingPathComponent:@"logo-transition.svg"]);
    GeneratePreview([outputDirectory stringByAppendingPathComponent:@"logo-system-preview.svg"]);
}

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        if (argc != 3) {
            fprintf(stderr, "Usage: generate_logo_assets --compare OUTPUT.svg | --generate OUTPUT_DIR\n");
            return 1;
        }
        NSString *destination = [NSString stringWithUTF8String:argv[2]];
        if (strcmp(argv[1], "--compare") == 0) {
            GenerateComparison(destination);
        } else if (strcmp(argv[1], "--generate") == 0) {
            GenerateLogoSystem(destination);
        } else {
            fprintf(stderr, "Unknown mode: %s\n", argv[1]);
            return 1;
        }
    }
    return 0;
}
