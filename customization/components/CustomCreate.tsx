import React, {useEffect, useState, useContext} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Redirect} from '../../src/components/Router';
import Toast from '../../react-native-toast-message';
import {ErrorContext} from '../../src/components/common';
import {
  isWebInternal,
  isMobileUA,
  trimText,
} from '../../src/utils/common';
import {useString} from '../../src/utils/useString';
import useCreateRoom from '../../src/utils/useCreateRoom';
import {
  RoomInfoDefaultValue,
  useRoomInfo,
} from '../../src/components/room-info/useRoomInfo';
import Spacer from '../../src/atoms/Spacer';
import ThemeConfig from '../../src/theme';
import hexadecimalTransparency from '../../src/utils/hexadecimalTransparency';
import {useSetRoomInfo} from '../../src/components/room-info/useSetRoomInfo';
import isSDK from '../../src/utils/isSDK';
import {LogSource, logger} from '../../src/logger/AppBuilderLogger';
import StorageContext from '../../src/components/StorageContext';
import { AgoraLogo, AgoraOpenAILogo, OpenAILogo, CallIcon } from './icons';

const CustomCreate = () => {
  const {
    data: {
      roomId: {host},
    },
  } = useRoomInfo();
  const {setGlobalErrorMessage} = useContext(ErrorContext);
  const [loading, setLoading] = useState(false);
  const [roomTitle, onChangeRoomTitle] = useState('');
  const [roomCreated, setRoomCreated] = useState(false);
  const createRoomFun = useCreateRoom();
  const {setRoomInfo} = useSetRoomInfo();
  const {setStore} = useContext(StorageContext);
  const loadingText = useString('loadingText')();

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
    setStore(prevState => {
      return {
        ...prevState,
        displayName: "You",
      };
    });
    // set default meeting name
    onChangeRoomTitle(generateChannelId)

  }, [])

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
        setRoomCreated(true);
      } catch (error) {
        setLoading(false);
        logger.error(
          LogSource.Internals,
          'CREATE_MEETING',
          'There was error while creating meeting',
          error,
        );
        setGlobalErrorMessage({
          name: "Unable to join channel",
          message: error.message,
        });
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
    <>
      {!roomCreated ? (
        <View style={style.root}>
            <View style={style.topLogoContainer}>
              <View style={{paddingTop: 14}}>
                <AgoraLogo />
              </View>
              <View>
                <OpenAILogo />
              </View>
            </View>
            <View style={{ width:456, marginTop:90, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <View style={style.centerLogoContainer}>
                  <View style={{padding: 20}}>
                    <AgoraOpenAILogo />
                  </View>
                  <Text style={style.mainTextStyle}>Agora & OpenAI</Text>
                  <Spacer size={20} />
                  <Text style={style.subTextStyle}>Agora Conversational AI demo</Text>
                  <Text style={style.subTextStyle}>built in partnership with OpenAI</Text>
              </View>
              <Spacer size={20} />
              <TouchableOpacity
                  disabled={loading || !roomTitle?.trim()}
                  style={style.btnContainer}
                  onPress={() => {
                    if (!$config.BACKEND_ENDPOINT) {
                      showError();
                    } else {
                      // !roomTitle?.trim() &&
                      //   onChangeRoomTitle(randomRoomTitle);
                      createRoomAndNavigateToShare(
                        roomTitle?.trim(),
                        false,
                        false
                      );
                    }
                  }}
                > 
                  <CallIcon fill='#111111'/>
                  <Text style={{
                    textAlign:'center',
                    fontSize: 18,
                    fontStyle: 'normal',
                    fontWeight: '600',
                    lineHeight: 18,
                  }}>{loading ? loadingText : 'Join Call'}</Text>
              </TouchableOpacity>
            </View>
        </View>
      ) : (
        <Redirect to={host} />
      )}
    </>
  );
};

const style = StyleSheet.create({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection:'column',
    padding:20,
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#111',
    borderRadius: 20,
  },
  mainMobile:{
    paddingBottom:80,
    paddingTop:66,
    flex:1
  },
  mobileContainerStyle:{
   backgroundColor:'transparent',
   flex:1,
   paddingBottom:0,
   paddingTop:0

  },
  btnContainer: {
    width: '100%',
    alignItems: 'center',
    display: 'flex',
    flexDirection:'row',
    height:56,
    padding:20,
    justifyContent: "center",
    alignContent: "center",
    gap: 8,
    borderRadius: 4,
    backgroundColor: '#00C2FF'
  },
  separator: {
    height: 1,
  },
  topLogoContainer: {
    paddingVertical:20,
    paddingHorizontal:32,
    display:'flex',
    width:"auto",
    flexDirection: 'row',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    flexShrink: 0,
    alignSelf: 'stretch'
  },
  centerLogoContainer: {
    padding:40,
    display: 'flex',
    paddingHorizontal: 8,
    flexFirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  mainTextStyle: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 40,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 40,
    letterSpacing: 1,
  },
  subTextStyle: {
    color: '#FFFFFF' + hexadecimalTransparency['70%'],
    textAlign: 'center',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21.6,
  },
});


export default CustomCreate;
