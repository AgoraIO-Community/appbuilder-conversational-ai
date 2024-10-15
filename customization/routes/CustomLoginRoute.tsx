import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';

export default function CustomLoginRoute() {



  const handleSSOLogin = () => {
    const AGORA_SSO_LOGIN = 'https://sso2.agora.io/api/v0/oauth/authorize';
    const REDIRECT_URL =
      'https://agora-realtime-proxy-590d34bfeb04.herokuapp.com/login'; 
    const REDIRECT_URL_PROD=' https://agora-realtime-proxy-590d34bfeb04.herokuapp.com/login';
    const AGORA_SSO_CLIENT_ID = 'openai_agora'; 
    const originURL = window.location.origin+'/validate'

    const ssoUrl = `${AGORA_SSO_LOGIN}?scope=basic_info&response_type=code&state=url=${originURL}&redirect_uri=${REDIRECT_URL}&client_id=${AGORA_SSO_CLIENT_ID}`;
    console.log('sso',ssoUrl)
    window.location.href = ssoUrl;

  };

  useEffect(() => {
    handleSSOLogin();
  }, []);

  return <></>;
}
