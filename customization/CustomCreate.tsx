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
import {Redirect} from '../src/components/Router';
import PrimaryButton from '../src/atoms/PrimaryButton';
import Toast from '../react-native-toast-message';
import {ErrorContext} from '../src/components/common';
import {
  isWebInternal,
  maxInputLimit,
  isMobileUA,
  trimText,
} from '../src/utils/common';
import {useString} from '../src/utils/useString';
import useCreateRoom from '../src/utils/useCreateRoom';
import {CreateProvider} from '../src/pages/create/useCreate';
import {
  RoomInfoDefaultValue,
  useRoomInfo,
} from '../src/components/room-info/useRoomInfo';
import Input from '../src/atoms/Input';
import Card from '../src/atoms/Card';
import Spacer from '../src/atoms/Spacer';
import ThemeConfig from '../src/theme';
import hexadecimalTransparency from '../src/utils/hexadecimalTransparency';
import {useSetRoomInfo} from '../src/components/room-info/useSetRoomInfo';
import IDPLogoutComponent from '../src/auth/IDPLogoutComponent';
import isSDK from '../src/utils/isSDK';
import {
  createRoomErrorToastHeading,
  createRoomErrorToastSubHeading,
  createRoomSuccessToastHeading,
  createRoomSuccessToastSubHeading,
} from '../src/language/default-labels/createScreenLabels';
import {LogSource, logger} from '../src/logger/AppBuilderLogger';

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

  const loadingText = useString('loadingText')();

  //toast
  const createRoomSuccessToastHeadingText = useString(
    createRoomSuccessToastHeading,
  );
  const createRoomSuccessToastSubHeadingText = useString(
    createRoomSuccessToastSubHeading,
  )();
  //toast

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
          text1: createRoomSuccessToastHeadingText(trimText(roomTitle)),
          text2: createRoomSuccessToastSubHeadingText,
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
                  <CustomLogo />
                </View>
                <Spacer size={isDesktop ? 20 : 16} />
                <Text style={style.heading}>Create a channel</Text>
                <Spacer size={40} />
                <Input
                  maxLength={maxInputLimit}
                  labelStyle={style.inputLabelStyle}
                  label={'Your Channel Name'}
                  value={roomTitle}
                  placeholder={'Channal Name'}
                  onChangeText={text => onChangeRoomTitle(text)}
                  onSubmitEditing={() => {
                    if (!roomTitle?.trim()) {
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
                  disabled={loading || !roomTitle?.trim()}
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
                  text={loading ? loadingText : 'Create a channel'}
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

const CustomLogo = () => {
  return (
    <div style={style.customLogoMainContainer}>
      <div style={style.customLogoSVGContainer}>
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="22" viewBox="0 0 21 22" fill="none">
          <path d="M10.496 16.7876C9.35026 16.7876 8.23023 16.4482 7.27757 15.8122C6.3249 15.1763 5.58239 14.2724 5.14393 13.2148C4.70546 12.1573 4.59074 10.9936 4.81427 9.87089C5.03779 8.7482 5.58953 7.71694 6.39971 6.90753C7.20988 6.09811 8.24211 5.54689 9.36585 5.32358C10.4896 5.10026 11.6544 5.21487 12.7129 5.65292C13.7715 6.09098 14.6762 6.83279 15.3128 7.78456C15.9493 8.73633 16.2891 9.85531 16.2891 11C16.2875 12.5345 15.6767 14.0057 14.5906 15.0908C13.5045 16.1758 12.032 16.7861 10.496 16.7876ZM17.2419 2.56827L17.1536 2.68579C17.1049 2.75071 17.0128 2.76384 16.9478 2.71517L16.836 2.62703C15.5071 1.6239 13.9584 0.950884 12.3178 0.663529C10.6773 0.376175 8.99179 0.482718 7.40054 0.974366C5.80929 1.46601 4.35788 2.32867 3.16609 3.49115C1.97429 4.65362 1.07629 6.08258 0.546187 7.6601C0.0160829 9.23762 -0.130923 10.9185 0.117301 12.5639C0.365526 14.2094 1.00186 15.7723 1.9738 17.1237C2.94573 18.475 4.2254 19.5761 5.70719 20.336C7.18898 21.0959 8.83041 21.4929 10.496 21.4941C12.7869 21.5007 15.0158 20.7509 16.836 19.3612L16.9478 19.279C17.0117 19.2279 17.106 19.2418 17.1536 19.3083L17.2419 19.4259C17.6382 19.9723 18.1411 20.433 18.7202 20.7804C19.2993 21.1277 19.9428 21.3545 20.6118 21.4471C20.8172 21.4751 21 21.3155 21 21.1082V0.89175C21 0.684521 20.8172 0.524908 20.6118 0.552882C19.9433 0.645086 19.3003 0.871101 18.7212 1.2174C18.1422 1.56369 17.639 2.02315 17.2419 2.56827Z" fill="#111111"/>
        </svg>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="95" height="18" viewBox="0 0 95 18" fill="none">
        <path d="M0.286563 14L5.84656 -9.53674e-07H7.98656L13.5866 14H10.7466L9.76656 11.46H4.04656L3.04656 14H0.286563ZM4.96656 9.1H8.84656L7.90656 6.66C7.28656 5.02 6.92656 3.6 6.92656 3.6C6.92656 3.6 6.54656 5.02 5.92656 6.66L4.96656 9.1ZM19.1186 18C16.5586 18 14.4186 16.8 13.6786 14.94L16.0786 14.04C16.3586 14.9 17.3386 15.76 19.0586 15.76C20.9986 15.76 22.2186 14.72 22.2186 12.78V12.12C21.3786 13.02 20.1986 13.52 18.7786 13.52C15.8586 13.52 13.6786 11.2 13.6786 8.26C13.6786 5.32 15.8386 3.02 18.7786 3.02C20.3586 3.02 21.6586 3.64 22.4986 4.76V3.24H24.9986C24.7786 3.82 24.7186 5 24.7186 6.22V12.7C24.7186 16.02 22.4786 18 19.1186 18ZM16.0986 8.26C16.0986 9.96 17.4386 11.3 19.1386 11.3C20.8986 11.3 22.1986 10.02 22.1986 8.26C22.1986 6.52 20.8986 5.22 19.1386 5.22C17.4386 5.22 16.0986 6.56 16.0986 8.26ZM32.2102 14.22C28.8702 14.22 26.5302 11.9 26.5302 8.64C26.5302 5.4 28.9302 3.02 32.0102 3.02C34.9902 3.02 37.2302 5.24 37.2302 8.14C37.2302 8.46 37.1902 9 37.1502 9.26H29.0302C29.3102 10.88 30.4902 11.92 32.1302 11.92C33.5302 11.92 34.4702 11.26 34.6902 10.28L37.2902 10.54C36.7502 12.84 34.9702 14.22 32.2102 14.22ZM29.1502 7.2H34.5502C34.4902 6.04 33.4302 5.22 31.9702 5.22C30.5302 5.22 29.5502 5.98 29.1502 7.2ZM46.8028 8.16C46.8028 6.56 45.7828 5.42 44.2628 5.42C42.7028 5.42 41.6828 6.52 41.6228 8.6V14H39.1228V3.24H41.3628V5.06C42.1628 3.78 43.4428 3.02 44.9828 3.02C47.6028 3.02 49.3028 5 49.3028 8V14H46.8028V8.16ZM55.9875 14.16C53.6875 14.16 52.3075 12.74 52.3075 10.24V5.36H50.3275V3.24H52.3075V0.439999H54.8275V3.24H57.4475V5.36H54.8275V10.02C54.8275 11.44 55.5475 11.92 56.4475 11.92C56.9275 11.92 57.2675 11.78 57.4675 11.7L57.6275 13.8C57.3275 13.94 56.8075 14.16 55.9875 14.16ZM66.1848 14V2.5H62.2648V-9.53674e-07H72.7448V2.5H68.8248V14H66.1848ZM77.6008 14.22C74.2608 14.22 71.9208 11.9 71.9208 8.64C71.9208 5.4 74.3208 3.02 77.4008 3.02C80.3808 3.02 82.6208 5.24 82.6208 8.14C82.6208 8.46 82.5808 9 82.5408 9.26H74.4208C74.7008 10.88 75.8808 11.92 77.5208 11.92C78.9208 11.92 79.8608 11.26 80.0808 10.28L82.6808 10.54C82.1408 12.84 80.3608 14.22 77.6008 14.22ZM74.5408 7.2H79.9408C79.8808 6.04 78.8208 5.22 77.3608 5.22C75.9208 5.22 74.9408 5.98 74.5408 7.2ZM92.1934 8.16C92.1934 6.56 91.1734 5.42 89.6534 5.42C88.0934 5.42 87.0734 6.52 87.0134 8.6V14H84.5134V3.24H86.7534V5.06C87.5534 3.78 88.8334 3.02 90.3734 3.02C92.9934 3.02 94.6934 5 94.6934 8V14H92.1934V8.16Z" fill="#00C2FF"/>
      </svg>
    </div>
  );
};

const style = StyleSheet.create({
  customLogoMainContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  customLogoSVGContainer: {
    display: 'flex',
    width: 32,
    height: 32,
    paddingRight: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#00C2FF',
  },
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
    fontSize: ThemeConfig.FontSize.extraLarge,
    fontWeight: '700',
    lineHeight: ThemeConfig.FontSize.extraLarge,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    opacity: ThemeConfig.EmphasisOpacity.high,
  },
  headline: {
    fontSize: 18,
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
