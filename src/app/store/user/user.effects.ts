import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { loginUser, loginUserFail, loginUserSuccess, registerUser, registerUserFail, registerUserSuccess, verifyOtp, verifyOtpFail, verifyOtpSuccess } from "./user.action";
import { UserService } from "../../features/user/services/user.service";
import { catchError, exhaustMap, map, mergeMap, of, tap } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from "@angular/router";
import { Token } from "@angular/compiler";
import { addUser, addUserFail, addUserSuccess, blockUser, blockUserFail, blockUserSuccess, editUser, editUserFail, editUserSuccess, getUsers, getUsersFail, getUsersSuccess } from "../admin/admin.action";
import { AdminService } from "src/app/features/admin/services/admin.service";
import { IUserData } from "src/app/core/interfaces/IUserData";


@Injectable({ providedIn: 'root' })
export class UserEffects {

  constructor(
    private _actions$: Actions,
    private _userService: UserService,
    private _cookieService: CookieService,
    private _spinner: NgxSpinnerService,
    private _router: Router,
    private _adminService:AdminService
  ) {
   
  }

  registerUser$ = createEffect(() =>
    this._actions$.pipe(
      ofType(registerUser),
      tap(() => this._spinner.show()),
      exhaustMap(action =>
        this._userService.userRegister(action.userData).pipe(
          tap(data => this._cookieService.set('userData', JSON.stringify(data), { expires: 1 / 24 })),
          tap((data) => {
            if (data) {
              this._spinner.hide();
              this._router.navigateByUrl('/otp-verify')
            }
          }),
          map(user => registerUserSuccess({ user })),

          catchError(({ error }) => of(registerUserFail({ error: error.message })).pipe(
            tap((data) => {
              if (data) {
                this._spinner.hide()
              }
            })
          ))
        )
      )
    )
  )


 OtpVerification$ = createEffect(()=>
    this._actions$.pipe(
      ofType(verifyOtp),
      tap(() =>this._spinner.show()),
      exhaustMap(action=>
        this._userService.verifyOtp(action.userData,action.otp).pipe(
          tap(data=> this._cookieService.set('token',data.token,{path:''})),
           map((userData:IUserData)=>verifyOtpSuccess({userData})),
           tap((data)=>{
            if(data) {
              this._router.navigateByUrl('home')
              this._cookieService.delete('userData')
               this._spinner.hide()
            }
           }),
          catchError(error=>of(verifyOtpFail({error:error.error.message})).pipe(
            tap((data)=>{
              if(data) {
                 this._spinner.hide()
              }
             })
          )
        )  
          )
        )
      )
    )


 $login = createEffect(()=>
   this._actions$.pipe(
    ofType(loginUser),
    tap(() =>this._spinner.show()),
    exhaustMap(action=>
      this._userService.userLogin(action.email,action.password).pipe(
        tap(data=> this._cookieService.set('token',data.token,{path:''})),
        map((userData)=>loginUserSuccess({userData})),
        tap((data)=>{
          
           if(data) {
              this._spinner.hide()
             
              this._router.navigateByUrl('/home')
           }
          }),
        catchError(error=>of(loginUserFail(error)).pipe(
          tap((data)=>{
            console.log(data,'error')  
            if(data) {
               this._spinner.hide()
            }
           })
        )
      )
      )
    )
   )
 )
 

 /// get users data 

 getUsersData$ = createEffect(()=>
  this._actions$.pipe(
    ofType(getUsers),
    mergeMap(()=>
      this._adminService.getUsersData().pipe(
        map(user=>getUsersSuccess({users:user})),
        catchError(error=> of(getUsersFail({error})))
      )
    )
  )
)

// block user

blockUser$ = createEffect(()=>
  this._actions$.pipe(
    ofType(blockUser),
    tap(() =>this._spinner.show()),
    exhaustMap(action=>
      this._adminService.blockUser(action.email).pipe(
      
        map((users)=>blockUserSuccess({users:users})),
        tap((data)=>{
          
          if(data) {
             this._spinner.hide()
          }
         }),
        catchError(error=>of(blockUserFail({error})))
      )
    )
  )
)


// add user

addUser$ = createEffect(()=>
  this._actions$.pipe(
    ofType(addUser),
    mergeMap(action=>
      this._adminService.addUser(action.userData).pipe(
        map((users)=>addUserSuccess({users})),
        catchError(error=>of(addUserFail(error)))
      )
    )
  )
)
   // edit user
editUser$ = createEffect(()=>
this._actions$.pipe(
  ofType(editUser),
  mergeMap(action=>
    this._adminService.editUser(action.userData).pipe(
      map(users=>editUserSuccess({users})),
      catchError(error=>of(editUserFail(error)))
    )
  )
)
)

}