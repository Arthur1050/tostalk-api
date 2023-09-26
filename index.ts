import { serverHttp } from "./http"
import "./ws"

serverHttp.listen(3001, () => {
    console.log("Server iniciado na porta 3001!")
})