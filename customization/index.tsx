import React, {useEffect, useState, useContext} from "react";
import RtcEngine from "bridge/rtc/webNg";
import {ILocalAudioTrack, IRemoteAudioTrack} from 'agora-rtc-sdk-ng'
import {  View,TouchableOpacity, Text } from "react-native";
import {
	customize,
	MaxVideoView,
	useContent,
	useLocalUid,
	type LayoutComponent,
	useRtc,
	useLocalAudio,
	useIsAudioEnabled,
	isMobileUA,
	ToolbarPreset,
	useEndCall
} from "customization-api";
import AudioVisualizer, {
	DisconnectedView,
} from "./components/AudioVisualizer";
import Bottombar from './components/Bottombar'
import CustomCreate from './components/CustomCreate'
import CustomCreateNative from './components/CustomCreateNative'
import {AI_AGENT_UID} from "./components/AgentControls/const"
import {ActiveSpeakerAnimation } from "./components/LocalAudioWave"
import MobileTopBar from './components/mobile/Topbar'
import MobileLayoutComponent from "./components/mobile/MobileLayoutComponent";
import MobileBottombar from './components/mobile/Bottombar'
import {AgentProvider} from './components/AgentControls/AgentContext';
import { AgentContext } from './components/AgentControls/AgentContext';
import { AgentState } from './components/AgentControls/const'
import CustomLoginRoute from "./routes/CustomLoginRoute";
import CustomValidateRoute from "./routes/CustomValidateRoute";
import Toast from "../react-native-toast-message/index";
import {AGENT_PROXY_URL, AGORA_SSO_LOGOUT_PATH, AGORA_SSO_BASE} from "./components/AgentControls/const"


const Topbar = () => {
	return <ToolbarPreset align="top" items={{
		"meeting-title": {hide: true},
		"participant-count": {hide:true},
		"recording-status": {hide:true},
		"chat": {hide:true},
		"participant": {hide:true},
		"settings": {hide:true},
		"Logout": {
			align:"end",
			component: () => {
				const {agentAuthToken, setAgentAuthToken} = useContext(AgentContext);
				const endcall =  useEndCall();

				const ssoLogout = async () => {
					const logoutUrl = `${AGENT_PROXY_URL}/logout`

					const response = await fetch(logoutUrl, {
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${agentAuthToken}`,
						}
					})

					// if (!response.ok) {
					// 	throw new Error(`HTTP error! status: ${response.status}`);
					// }
					await endcall()
					setAgentAuthToken(null)

					const data = await response.json();

					console.log({logoutdata: data})

					return data;

				}
				const logout = async () => {
					try{
						// await ssoLogout()
						const originURL = window.location.origin+'/create'
						const frontend_redirect_creds = {
							token: agentAuthToken,
							frontend_redirect: originURL
						}
						const REDIRECT_URL=`${AGENT_PROXY_URL}/logout?state=${JSON.stringify(frontend_redirect_creds)}`;
						const ssoUrl = `${AGORA_SSO_BASE}/${AGORA_SSO_LOGOUT_PATH}?redirect_uri=${REDIRECT_URL}`;
						// console.log({REDIRECT_URL})
						window.open(`${ssoUrl}`, "_self")
					}catch(error){
						console.log({logoutFailed: error})
					}
				}


				return <TouchableOpacity style={{
					display: 'flex',
					height: 35,
					padding: 20,
					justifyContent: 'space-between',
					alignItems: 'center',
					gap: 8,
					borderRadius: 4, 
					borderWidth: 1, 
					borderColor: '#00C2FF',
					flexDirection:'row',	
				}}
				onPress={logout}>
					<Text style={{color: "#FFF"}}>Logout</Text>
				</TouchableOpacity>
			}
		}
	}}/>
};

const DesktopLayoutComponent: LayoutComponent = () => {
	const localUid = useLocalUid();
	const { defaultContent, activeUids } = useContent();
	const { RtcEngineUnsafe } = useRtc();
    const [localTracks, setLocalTrack] = useState<ILocalAudioTrack | null>(null);
	const [remoteTrack, setRemoteTrack] = useState<IRemoteAudioTrack | null>(null);

	const { getLocalAudioStream,getRemoteAudioStream} = useLocalAudio();
	const isAudioEnabled = useIsAudioEnabled();
	const connected = activeUids.includes(AI_AGENT_UID);
	console.log({ activeUids }, "active uids");
	const {agentConnectionState, setAgentConnectionState} = useContext(AgentContext);

	// this state occurs when agent_stop is successful, but
	// user is still not disconnected from the RTC channel - state-of-wait
	const isAwaitingLeave = agentConnectionState === AgentState.AWAITING_LEAVE
	console.log({isAwaitingLeave}, {connected}, 'what is going on', agentConnectionState)
	useEffect(() => {
		if(getLocalAudioStream()){
			setLocalTrack(getLocalAudioStream())
		}
	}, [RtcEngineUnsafe])

	useEffect(() => {
		if(getRemoteAudioStream(AI_AGENT_UID)){
			setRemoteTrack(getRemoteAudioStream(AI_AGENT_UID))
		}
		
	}, [activeUids])


	return (
		<View
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				borderRadius: 10,
			}}
		>
			<MaxVideoView
				user={{
					...defaultContent[AI_AGENT_UID],
					name: "OpenAI",
					video: false,
				}}
				CustomChild={() =>
					// show agent voice waves, when agent is connected to the channel, but also not on a state-of-wait, 
					(connected && !isAwaitingLeave )? <AudioVisualizer audioTrack={remoteTrack} /> : <DisconnectedView isConnected={connected} />
				}
				hideMenuOptions={true}
			/>
			<View
				style={{
					position: "absolute",
					bottom: 10,
					right: 10,
					display: "flex",
					flexDirection: "row",
					height: 200,
					width: 300,
				}}
			>	
				<MaxVideoView user={defaultContent[localUid]} hideMenuOptions={true} />
				<View style={{
					position:"absolute",
					width:100,
					height:50,
					bottom:16,
					right:-38,
				}}>
				{
				localTracks && 
				isAudioEnabled(localUid) &&
				<ActiveSpeakerAnimation audioTrack={localTracks} isMuted={!isAudioEnabled(localUid)} />     
				}
				</View>
			</View>
		</View>
	);
};

const customization = customize({
	components: {
		appRoot: AgentProvider,
		create: isMobileUA() ? CustomCreateNative : CustomCreate,
		// preferenceWrapper: AgentProvider,
		videoCall: {
			customLayout() {
				return [
					{
						name: "Ai-Agent",
						label: "Ai-Agent",
						icon: "🤖",
						component: isMobileUA() ? MobileLayoutComponent : DesktopLayoutComponent,
					},
				];
			},
			topToolBar: isMobileUA() ? MobileTopBar : Topbar,
			bottomToolBar: isMobileUA() ? MobileBottombar : Bottombar,
		},
	},
});

export { AI_AGENT_UID };
export default customization;
