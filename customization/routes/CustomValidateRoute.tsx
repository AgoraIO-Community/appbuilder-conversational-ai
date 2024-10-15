import {StyleSheet, Text, View} from 'react-native';
import React, { useEffect } from 'react';

const CustomValidateRoute = () => {
  // check query paramas and navigate to Create with param loggedIN
  // if failed show toast faield to authenticate
  //  createRoomAndNavigateToShare(
  //                     roomTitle?.trim(),
  //                     false,
  //                     false
  //                   );
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search); 
    queryParams.forEach((value, key) => {
      console.log(`${key}: ${value}`); 
    });
  }, []);
  return (
    <View>
      <Text>Validate</Text>
    </View>
  );
};

export default CustomValidateRoute;
