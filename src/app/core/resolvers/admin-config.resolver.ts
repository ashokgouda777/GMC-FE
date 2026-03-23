import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ThemeService } from '../services/theme.service';

export const adminConfigResolver: ResolveFn<any> = () => {
    return inject(ThemeService).loadTheme();
};
