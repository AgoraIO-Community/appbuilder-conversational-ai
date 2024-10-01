import React, {useEffect, useState} from "react";
import RtcEngine from "bridge/rtc/webNg";
import {ILocalAudioTrack} from 'agora-rtc-sdk-ng'
import {  View, } from "react-native";
import {
	customize,
	MaxVideoView,
	useContent,
	useLocalUid,
	type LayoutComponent,
	useRtc,
	useLocalAudio,
	useIsAudioEnabled,
	isMobileUA
} from "customization-api";
import AudioVisualizer, {
	DisconnectedView,
} from "./components/AudioVisualizer";
import Bottombar from './components/Bottombar'
import CustomCreate from './components/CustomCreate'
import {AI_AGENT_UID} from "./components/AgentControls/const"
import {ActiveSpeakerAnimation } from "./components/LocalAudioWave"
import MobileTopBar from './components/mobile/Topbar'
import MobileLayoutComponent from "./components/mobile/MobileLayoutComponent";

const Topbar = () => {
	return null;
};

const DesktopLayoutComponent: LayoutComponent = () => {
	const localUid = useLocalUid();
	const { defaultContent, activeUids } = useContent();
	const { RtcEngineUnsafe } = useRtc();
    const [localTracks, setLocalTrack] = useState<ILocalAudioTrack | null>(null);

	const { getLocalAudioStream} = useLocalAudio();
	const isAudioEnabled = useIsAudioEnabled();
	const connected = activeUids.includes(AI_AGENT_UID);
	console.log({ activeUids }, "active uids");

	useEffect(() => {
		if(getLocalAudioStream()){
			setLocalTrack(getLocalAudioStream())
		}
	}, [RtcEngineUnsafe])

	useEffect(() => {

	}, [isAudioEnabled])


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
					connected ? <AudioVisualizer /> : <DisconnectedView isConnected={connected} />
				}
				hideMenuOptions={true}
			/>
			<View
				style={{
						position: "absolute",
						top: 10,
						right: 10,
						display: "flex",
						flexDirection: "row",
						height: 100,
						width: 215,		
				}}
			>	
				<MaxVideoView user={defaultContent[localUid]} hideMenuOptions={true} avatarRadius={48}/>
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
		create: CustomCreate,
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
			bottomToolBar: Bottombar,
		},
	},
});

export { AI_AGENT_UID };
export default customization;
