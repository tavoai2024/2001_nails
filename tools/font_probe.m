#import <AppKit/AppKit.h>

int main(void) {
    @autoreleasepool {
        NSArray<NSString *> *families = [[NSFontManager sharedFontManager] availableFontFamilies];
        for (NSString *family in families) {
            NSString *lower = family.lowercaseString;
            if ([lower containsString:@"didot"] ||
                [lower containsString:@"bodoni"] ||
                [lower containsString:@"baskerville"] ||
                [lower containsString:@"garamond"] ||
                [lower containsString:@"hoefler"] ||
                [lower containsString:@"iowan"] ||
                [lower containsString:@"cochin"] ||
                [lower containsString:@"palatino"] ||
                [lower containsString:@"times new roman"]) {
                printf("%s\n", family.UTF8String);
                NSArray *members = [[NSFontManager sharedFontManager] availableMembersOfFontFamily:family];
                for (NSArray *member in members) {
                    printf("  %s\n", [member[0] UTF8String]);
                }
            }
        }
    }
    return 0;
}
