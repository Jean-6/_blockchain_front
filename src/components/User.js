import {useEffect, useState} from 'react';

import {useNavigate} from 'react-router-dom';

import axios from 'axios';

export default function User() {
    const navigate = useNavigate();

    const [session, setSession] = useState({});

    useEffect(() => {
        axios(`${process.env.REACT_APP_SERVER_URL}/authenticate`, {
            withCredentials: true,
        })
            .then(({data}) => {
                const {iat, ...authData} = data; // remove unimportant iat value

                setSession(authData);
            })
            .catch((err) => {
                navigate('/signin');
            });
        //call the api to get the /get-all-balance
        axios(`${process.env.REACT_APP_SERVER_URL}/get-all-balance`, {
            withCredentials: true,
        })
            .then(({data}) => {
                // Handle the response data here...
                console.log(data);
            })
            .catch((err) => {
                // Handle the error here...
                console.error(err);
            });
    }, []);
//
    async function signOut() {
        await axios(`${process.env.REACT_APP_SERVER_URL}/logout`, {
            withCredentials: true,
        });

        navigate('/signin');
    }

    return (
        <div style={{color:"white"}}>
            <h3>User session:</h3>
            <pre>{JSON.stringify(session, null, 2)}</pre>
            <button type="button" onClick={signOut}>
                Sign out
            </button>
        </div>
    );
}