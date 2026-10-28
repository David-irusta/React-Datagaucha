import { useParams } from 'react-router-dom'
import React from "react";

const Users = () => {
    const { idUser, userName } = useParams();

    return(
        <div>
            <span>SOY LA PANTALLA DE USERS {idUser} - {userName}</span>
        </div>
    )
}

export default Users;