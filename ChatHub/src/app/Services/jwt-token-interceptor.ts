import { HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Service } from './service';
import { finalize, Observable } from 'rxjs';
@Injectable()

export class jwtTokenInterceptor implements HttpInterceptor {
  constructor(private service: Service) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.service.show();

    const token = localStorage.getItem('token');
    const newrequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });


    return next.handle(newrequest).pipe(
      finalize(() => {
        setTimeout(() => {
          this.service.hide()
        }, 5000);
      })
    );
  }
}


// export const jwtToken: HttpInterceptorFn = (req, next) => {
//   const token = localStorage.getItem('token');
//   const newrequest = req.clone({
//     setHeaders: {
//       Authorization: `Bearer ${token}`
//     }
//   });
//   return next(newrequest);
// };
