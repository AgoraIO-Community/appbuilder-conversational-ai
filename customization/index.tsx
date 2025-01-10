import React, {useEffect, useState, useContext} from "react";
import RtcEngine from "bridge/rtc/webNg";
import {ILocalAudioTrack, IRemoteAudioTrack} from 'agora-rtc-sdk-ng'
import {  View,TouchableOpacity, Text,StyleSheet } from "react-native";
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
	useEndCall,
	useSidePanel,
	ToolbarItem,
	IconButton
} from "customization-api";
import AudioVisualizer, {
	DisconnectedView,
} from "./components/AudioVisualizer";
import Bottombar from './components/Bottombar'
import CustomCreate from './components/CustomCreate'
import CustomCreateNative from './components/CustomCreateNative'
import {ActiveSpeakerAnimation, AudioVisualizerEffect } from "./components/LocalAudioWave"
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
import { useMultibandTrackVolume } from "./utils";
import CustomSidePanel from "./components/CustomSidePanel";


const Topbar = () => {
	const { sidePanel, setSidePanel } = useSidePanel();
	React.useEffect(() => {
		setSidePanel('agent-transcript-panel')
	},[])
	return <ToolbarPreset align="top" items={{
		"meeting-title": {hide: true},
		"participant-count": {hide:true},
		"recording-status": {hide:true},
		"chat": {hide:true},
		"participant": {hide:true},
		"settings": {hide:false},
		"agentTanscript":{
			align:"end",
			component: () => {
				const {agentAuthToken, setAgentAuthToken} = useContext(AgentContext);
				const isOpen = sidePanel === "agent-transcript-panel";

				const handlePress = () => {
				  setSidePanel(isOpen ? null : "agent-transcript-panel");
				};
				return  <ToolbarItem >
				<IconButton
				  iconProps={{
					name: "chat-nav",
					iconSize: 24,
					tintColor: "white",
					iconBackgroundColor:isOpen ? $config.PRIMARY_ACTION_BRAND_COLOR : $config.ICON_BG_COLOR
				  }}
				  btnTextProps={{
					textColor: "white",
				  }}
				  onPress={handlePress}
				/>
			  </ToolbarItem>
			}
		},
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

                return null
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
	const [mediaStreamTrack, setMediaStreamTrack] =
    React.useState<MediaStreamTrack>()
	
	const {agentConnectionState, setAgentConnectionState,agentUID} = useContext(AgentContext);

	const { getLocalAudioStream,getRemoteAudioStream} = useLocalAudio();
	const isAudioEnabled = useIsAudioEnabled();
	const connected = activeUids.includes(agentUID);
	console.log({ activeUids }, "active uids");
	

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
		if(getRemoteAudioStream(agentUID)){
			setRemoteTrack(getRemoteAudioStream(agentUID))
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
					...defaultContent[agentUID],
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
					bottom:16,
					right:10,
				}}>
				{
				localTracks && 
			
				<AudioVisualizerEffect  type="user"
					barWidth={3}
					minBarHeight={2}
					maxBarHeight={25}
					audioTrack={localTracks}
					borderRadius={2}
					gap={4}/>  
				 
				}
				</View>
			</View>
		</View>
	);
};

// const CustomSidePanel = () => {
// 	const {RtcEngineUnsafe} = useRtc()
// 	const {isSubscribedForStreams,setIsSubscribedForStreams} = useContext(AgentContext);

// 	const messageCache = {};
// 	const TIMEOUT_MS = 5000; // Timeout for incomplete messages
	
// 	React.useEffect( () => {
// 		if(!isSubscribedForStreams) {
// 			RtcEngineUnsafe.addListener(
// 				'onStreamMessage',
// 				handleStreamMessageCallback,
// 			);
// 			setIsSubscribedForStreams(true)
// 		}
// 	} ,[])

// 	const handleStreamMessageCallback = (...args) =>{
		
// 		console.log("rec", args)
// 		parseData(args[1])
	
// 	} 

// 	const parseData  = (data) => {
// 		let decoder = new TextDecoder("utf-8");
// 		let decodedMessage = decoder.decode(data);
// 		console.log("[test] textstream raw data", decodedMessage);
//         handleChunk(decodedMessage)
// 	}
// 	 // Function to process received chunk via event emitter
// 	 const handleChunk = (formattedChunk: string) => {
// 		try {
// 		  // Split the chunk by the delimiter "|"
// 		  const [message_id, partIndexStr, totalPartsStr, content] =
// 			formattedChunk.split("|");
	
// 		  const part_index = parseInt(partIndexStr, 10);
// 		  const total_parts =
// 			totalPartsStr === "???" ? -1 : parseInt(totalPartsStr, 10); // -1 means total parts unknown
	
// 		  // Ensure total_parts is known before processing further
// 		  if (total_parts === -1) {
// 			console.warn(
// 			  `Total parts for message ${message_id} unknown, waiting for further parts.`
// 			);
// 			return;
// 		  }
	
// 		  const chunkData = {
// 			message_id,
// 			part_index,
// 			total_parts,
// 			content,
// 		  };
	
// 		  // Check if we already have an entry for this message
// 		  if (!messageCache[message_id]) {
// 			messageCache[message_id] = [];
// 			// Set a timeout to discard incomplete messages
// 			setTimeout(() => {
// 			  if (messageCache[message_id]?.length !== total_parts) {
// 				console.warn(`Incomplete message with ID ${message_id} discarded`);
// 				delete messageCache[message_id]; // Discard incomplete message
// 			  }
// 			}, TIMEOUT_MS);
// 		  }
	
// 		  // Cache this chunk by message_id
// 		  messageCache[message_id].push(chunkData);
	
// 		  // If all parts are received, reconstruct the message
// 		  if (messageCache[message_id].length === total_parts) {
// 			const completeMessage = reconstructMessage(
// 			  messageCache[message_id]
// 			);
// 			const { stream_id, is_final, text, text_ts } = JSON.parse(
// 			  atob(completeMessage)
// 			);
// 			const textItem = {
// 			  uid: `${stream_id}`,
// 			  time: text_ts,
// 			  dataType: "transcribe",
// 			  text: text,
// 			  isFinal: is_final,
// 			};
	
// 			if (text.trim().length > 0) {
// 			//this.emit("textChanged", textItem);
// 			console.warn("emit textChanged: ",textItem)
// 			}
	
// 			// Clean up the cache
// 			delete messageCache[message_id];
// 		  }
// 		} catch (error) {
// 		  console.error("Error processing chunk:", error);
// 		}
// 	  }

// 	  const reconstructMessage = (chunks) => {
// 		// Sort chunks by their part index
// 		chunks.sort((a, b) => a.part_index - b.part_index);
	
// 		// Concatenate all chunks to form the full message
// 		return chunks.map((chunk) => chunk.content).join("");
// 	  }

// 	return (
// 	  <div style={styles.container}>
// 		<div style={styles.textContainer}>
// 		  <div style={styles.textStyle}>
// 			Here is your new custom side panel component.
// 		  </div>
// 		</div>
// 	  </div>
// 	);
//   };

const customization = customize({
	components: {
		appRoot: AgentProvider,
		create: isMobileUA() ? CustomCreateNative : CustomCreate,
		//preferenceWrapper: AgentProvider,
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
			customSidePanel: () => {
				return [
				  {
					name: "agent-transcript-panel",
					component: CustomSidePanel,
					title: "Agent Transcript",
					onClose: () => {},
				  },
				];
			  },
			topToolBar: isMobileUA() ? MobileTopBar : Topbar,
			bottomToolBar: isMobileUA() ? MobileBottombar : Bottombar,
		},
	},
});


export default customization;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#90EE90",
		justifyContent: "center",
		display: "flex",
	  },
	  textContainer: {
		display: "flex",
		height: "100%",
		justifyContent: "center",
		alignSelf: "center",
		borderRadius: 30,
	  },
	  textStyle: {
		padding: 10,
		fontSize: 20,
		alignSelf: "center",
	  },
  });
  
