/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useEffect, useState, useContext} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Redirect} from '../../src/components/Router';
import PrimaryButton from '../../src/atoms/PrimaryButton';
import Toast from '../../react-native-toast-message';
import {ErrorContext} from '../../src/components/common';
import {
  isWebInternal,
  maxInputLimit,
  isMobileUA,
  trimText,
} from '../../src/utils/common';
import {useString} from '../../src/utils/useString';
import useCreateRoom from '../../src/utils/useCreateRoom';
import {CreateProvider} from '../../src/pages/create/useCreate';
import {
  RoomInfoDefaultValue,
  useRoomInfo,
} from '../../src/components/room-info/useRoomInfo';
import Input from '../../src/atoms/Input';
import Card from '../../src/atoms/Card';
import Spacer from '../../src/atoms/Spacer';
import ThemeConfig from '../../src/theme';
import hexadecimalTransparency from '../../src/utils/hexadecimalTransparency';
import {useSetRoomInfo} from '../../src/components/room-info/useSetRoomInfo';
import IDPLogoutComponent from '../../src/auth/IDPLogoutComponent';
import isSDK from '../../src/utils/isSDK';
import {
  createRoomErrorToastHeading,
  createRoomErrorToastSubHeading,
  createRoomSuccessToastHeading,
  createRoomSuccessToastSubHeading,
} from '../../src/language/default-labels/createScreenLabels';
import {LogSource, logger} from '../../src/logger/AppBuilderLogger';
import StorageContext from '../../src/components/StorageContext';
import {LogoComponent} from './Bottombar';
import { useUserName } from 'customization-api';

const CustomCreate = () => {
  const {
    data: {
      roomId: {host},
    },
  } = useRoomInfo();
  const {setGlobalErrorMessage} = useContext(ErrorContext);
  const [loading, setLoading] = useState(false);
  const [roomTitle, onChangeRoomTitle] = useState('');
  // const [randomRoomTitle, setRandomRoomTitle] = useState('');
  const [pstnToggle, setPstnToggle] = useState(false);
  const [coHostToggle, setCoHostToggle] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);
  const createRoomFun = useCreateRoom();
  const {setRoomInfo} = useSetRoomInfo();
  const {setStore} = useContext(StorageContext);
  const [displayName, setDisplayName] = useState('');
  const [userName, setUserName] = useUserName();
  const loadingText = useString('loadingText')();

  const createRoomErrorToastHeadingText = useString(
    createRoomErrorToastHeading,
  )();
  const createRoomErrorToastSubHeadingText = useString(
    createRoomErrorToastSubHeading,
  )();

  const isDesktop = !isMobileUA();

  useEffect(() => {
    logger.log(
      LogSource.Internals,
      'CREATE_MEETING',
      'User has landed on create room',
    );
    if (isWebInternal() && !isSDK) {
      document.title = $config.APP_NAME;
    }
    console.log('[SDKEvents] Join listener registered');
    return () => {};
  }, []);

  // set default room and username
  useEffect(() => {
    const generateChannelId = () => {
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 16; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      return result;
    };
    // default username
    setUserName("You")
    // set default meeting name
    onChangeRoomTitle(generateChannelId)

  }, [])
  const showShareScreen = () => {
    setRoomCreated(true);
  };

  const createRoomAndNavigateToShare = async (
    roomTitle: string,
    enablePSTN: boolean,
    isSeparateHostLink: boolean,
  ) => {
    if (roomTitle !== '') {
      logger.log(
        LogSource.Internals,
        'CREATE_MEETING',
        'User wants to create room',
      );
      setLoading(true);
      try {
        setRoomInfo(RoomInfoDefaultValue);
        //@ts-ignore
        //isSeparateHostLink will be for internal usage since backend integration is not there
        await createRoomFun(roomTitle, enablePSTN, isSeparateHostLink);

        setLoading(false);
        Toast.show({
          leadingIconName: 'tick-fill',
          type: 'success',
          text1: "You have joined channel "+ trimText(roomTitle),
          text2: null,
          visibilityTime: 3000,
          primaryBtn: null,
          secondaryBtn: null,
          leadingIcon: null,
        });
        showShareScreen();
      } catch (error) {
        setLoading(false);
        logger.error(
          LogSource.Internals,
          'CREATE_MEETING',
          'There was error while creating meeting',
          error,
        );
        if (
          createRoomErrorToastHeadingText ||
          createRoomErrorToastSubHeadingText
        ) {
          setGlobalErrorMessage({
            name: createRoomErrorToastHeadingText,
            message: createRoomErrorToastSubHeadingText,
          });
        } else {
          setGlobalErrorMessage(error);
        }
      }
    }
  };
  const showError = () => {
    Toast.show({
      leadingIconName: 'alert',
      type: 'error',
      text1: 'Backend endpoint not configured',
      text2: 'Please configure backend endpoint config.json',
      visibilityTime: 1000 * 10,
      primaryBtn: null,
      secondaryBtn: null,
      leadingIcon: null,
    });
  };

  // const onChangeDisplayName = (name: string) => {
  //   setDisplayName(name);
  //   setStore(prevState => {
  //     return {
  //       ...prevState,
  //       displayName: name,
  //     };
  //   });
  // };

  return (
    <CreateProvider
      value={{
        showShareScreen,
      }}>
      {!roomCreated ? (
        <View style={style.root}>
          {!isMobileUA() ? (
            <IDPLogoutComponent containerStyle={{marginBottom: -100}} />
          ) : (
            <></>
          )}
          <ScrollView contentContainerStyle={style.main}>
            <Card>
              <View>
                <View style={style.logoContainerStyle}>
                  <LogoComponent />
                </View>
                <Spacer size={isDesktop ? 20 : 16} />
                {/* <Text style={style.heading}>Agora Conversational AI</Text> */}
                <Spacer size={20} />
                {/* <Input
                  maxLength={maxInputLimit}
                  labelStyle={style.inputLabelStyle}
                  label={'Your Name'}
                  value={displayName}
                  placeholder={'Your Name'}
                  onChangeText={text => onChangeDisplayName(text)}
                  onSubmitEditing={() => {
                    if (!roomTitle?.trim() || !displayName?.trim()) {
                      return;
                    } else {
                      if (!$config.BACKEND_ENDPOINT) {
                        showError();
                      } else {
                        // !roomTitle?.trim() &&
                        //   onChangeRoomTitle(randomRoomTitle);
                        createRoomAndNavigateToShare(
                          roomTitle?.trim(),
                          pstnToggle,
                          !coHostToggle,
                        );
                      }
                    }
                  }}
                />
                <Spacer size={40} /> */}
                <Input
                  maxLength={maxInputLimit}
                  labelStyle={style.inputLabelStyle}
                  label={'Channel Name'}
                  value={roomTitle}
                  placeholder={'Channal Name'}
                  onChangeText={text => onChangeRoomTitle(text)}
                  onSubmitEditing={() => {
                    if (!roomTitle?.trim() || !displayName?.trim()) {
                      return;
                    } else {
                      if (!$config.BACKEND_ENDPOINT) {
                        showError();
                      } else {
                        // !roomTitle?.trim() &&
                        //   onChangeRoomTitle(randomRoomTitle);
                        createRoomAndNavigateToShare(
                          roomTitle?.trim(),
                          pstnToggle,
                          !coHostToggle,
                        );
                      }
                    }
                  }}
                />
                <Spacer size={40} />
              </View>
              <View style={[style.btnContainer]}>
                <PrimaryButton
                  iconName={'video-plus'}
                  disabled={
                    loading || !roomTitle?.trim() || !displayName?.trim()
                  }
                  containerStyle={!isDesktop && {width: '100%'}}
                  onPress={() => {
                    if (!$config.BACKEND_ENDPOINT) {
                      showError();
                    } else {
                      // !roomTitle?.trim() &&
                      //   onChangeRoomTitle(randomRoomTitle);
                      createRoomAndNavigateToShare(
                        roomTitle?.trim(),
                        pstnToggle,
                        !coHostToggle,
                      );
                    }
                  }}
                  text={loading ? loadingText : 'JOIN CHANNEL'}
                />
              </View>
            </Card>
          </ScrollView>
        </View>
      ) : (
        <></>
      )}
      {roomCreated ? <Redirect to={host} /> : <></>}
    </CreateProvider>
  );
};

const style = StyleSheet.create({
  logoContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  root: {
    flex: 1,
  },
  inputLabelStyle: {
    paddingLeft: 8,
  },
  main: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  heading: {
    fontSize: ThemeConfig.FontSize.medium,
    fontWeight: '700',
    lineHeight: ThemeConfig.FontSize.medium,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    opacity: ThemeConfig.EmphasisOpacity.high,
  },
  headline: {
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
    color: $config.FONT_COLOR,
    marginBottom: 40,
  },
  btnContainer: {
    width: '100%',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  upper: {
    borderTopLeftRadius: ThemeConfig.BorderRadius.medium,
    borderTopRightRadius: ThemeConfig.BorderRadius.medium,
  },
  lower: {
    borderBottomLeftRadius: ThemeConfig.BorderRadius.medium,
    borderBottomRightRadius: ThemeConfig.BorderRadius.medium,
  },
  toggleLabel: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    marginRight: 4,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    alignSelf: 'center',
  },
  separator: {
    height: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    flex: 0.8,
  },
  infoToggleContainer: {
    flex: 0.2,
    alignItems: 'flex-end',
    alignSelf: 'center',
  },
  tooltipActiveBgStyle: {
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['20%'],
    borderRadius: 14,
    padding: 5,
  },
  tooltipDefaultBgStyle: {
    padding: 5,
  },
});

export default CustomCreate;
