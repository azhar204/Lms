import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";


export const ProtectedAdmin = ({children}) => {
    const {user} = useSelector(store=>store.auth);

    if(user?.role!=="admin"){
        return <Navigate to="/"/>
    }

    return children;
}