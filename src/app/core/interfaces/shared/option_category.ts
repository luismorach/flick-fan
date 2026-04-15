import { ParamsApi } from "./params-http.interface"

export interface OptionCategory{
    name:string
    id:number
    value:string
    params?:ParamsApi
}