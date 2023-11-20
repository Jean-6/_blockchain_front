import React, {useEffect, useState} from 'react';

function SignIn() {
    const [account, setAccount] = useState()


    useEffect(() => {
        async function init() {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts'
                })

                if (accounts && accounts[0]) {
                    setAccount(accounts[0])
                }
            } catch (error) {
                console.error('Error:', error)
            }
        }

        if (window.ethereum) {
            init()
        }
    }, [])


    useEffect(() => {
        if (!window.ethereum) {
            return
        }

        function handler(accounts) {
            setAccount(accounts[0])
        }

        window.ethereum.on('accountsChanged', handler)

        return () => {
            window.ethereum.removeListener('accountsChanged', handler)
        }
    }, [])


    async function handleConnect() {
        if (!window.ethereum) {
            alert('You need to install MetaMask extension first!')
        }

        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            })

            setAccount(accounts[0])
        } catch (error) {
            alert(error.message)
        }
    }


    // Show wallet address if connected
    if (account) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: "column"
            }}>
                <p>Account: {account}</p>
                <button
                    style={{
                        backgroundColor: '#4CAF50', /* Green */
                        border: 'none',
                        color: 'white',
                        padding: '15px 32px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'inline-block',
                        fontSize: '16px',
                        margin: '4px 2px',
                        cursor: 'pointer'
                    }}
                    onClick={
                        async () => {
                            window.location.href = "/cards";
                        }
                    }
                >
                    JOUER !
                </button>
            </div>
        )
    }


    // Otherwise, show connect button
    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <button
                style={{
                    backgroundColor: '#4CAF50', /* Green */
                    border: 'none',
                    color: 'white',
                    padding: '15px 32px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'inline-block',
                    fontSize: '16px',
                    margin: '4px 2px',
                    cursor: 'pointer'
                }}
                onClick={() => handleConnect()}
            >
                Authenticate via MetaMask
            </button>
        </div>

    )
}

export default SignIn;