import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenToUse='eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwOWQ1NTQyYzIyYzA1NjI4NGJjNjc5Y2I1YjhmMWU2MSIsInN1YiI6IjY2NjFjNTIyZmU5Mzg4Y2JmNjhkODA4NCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OVzwZj31hTW-I1K5AEgFocWr2s22Xt1i9cvdotbOBhw'
  const requestClone=req.clone(
    {setHeaders: { Authorization: `bearer ${tokenToUse}` }
  })
  return next(requestClone);

};
