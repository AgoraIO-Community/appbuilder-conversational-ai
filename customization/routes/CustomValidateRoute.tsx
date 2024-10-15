import {StyleSheet, Text, View} from 'react-native';
import React, { useContext, useEffect } from 'react';
import {Redirect, useHistory} from '../../src/components/Router';
import { AgentContext } from '../../customization/components/AgentControls/AgentContext';

const CustomValidateRoute = () => {
    const history = useHistory();
    const { setAgentAuthToken} = useContext(AgentContext);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search); 
    queryParams.forEach((value, key) => {
      console.log(`${key}: ${value}`); 
    });
    // check for success login from url param and redirect to create using custom param
    
      if (queryParams.has('token')) {
        // Redirect to create using custom param only if token exists
        setAgentAuthToken(queryParams.get('token') || '')
        history.push('/create?auth=success');
      }
  }, []);
  return (
    <></>
  );
};

export default CustomValidateRoute;
