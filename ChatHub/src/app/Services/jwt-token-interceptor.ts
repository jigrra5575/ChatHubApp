import { HttpInterceptorFn } from '@angular/common/http';

export const jwtTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const newrequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  return next(newrequest);
};
