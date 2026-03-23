import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Get token directly from localStorage to avoid circular dependency with AuthService
    const currentUserStr = localStorage.getItem('currentUser');
    let token = null;
    try {
        if (currentUserStr) {
            const user = JSON.parse(currentUserStr);
            token = user.token;
        }
    } catch (e) {
        console.error('Error parsing user token from localStorage', e);
    }

    const isLoginRequest = req.url.includes('/Users/login') || req.url.includes('/Users/userlogin');

    if (token && !isLoginRequest) {
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(cloned);
    }

    return next(req);
};
