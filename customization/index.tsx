import React, {useEffect, useRef, useState} from "react";
import RtcEngine from "bridge/rtc/webNg";
import {ILocalAudioTrack, IMicrophoneAudioTrack} from 'agora-rtc-sdk-ng'
import { Text, View, TouchableOpacity } from "react-native";
import {
	customize,
	MaxVideoView,
	useContent,
	useLocalUid,
	LayoutComponent,
	useRtc,
	useLocalAudio,
	useIsAudioEnabled
} from "customization-api";
import AudioVisualizer, {
	DisconnectedView,
} from "./components/AudioVisualizer";
import Bottombar from './components/Bottombar'
import CustomCreate from './components/CustomCreate'
import {AI_AGENT_UID} from "./components/AgentControls/const"
import {ActiveSpeakerAnimation } from "./components/LocalAudioWave"

const Topbar = () => {
	return null;
};

const LayoutComponentE: LayoutComponent = () => {
	const localUid = useLocalUid();
	const { defaultContent, activeUids } = useContent();
	const { RtcEngineUnsafe } = useRtc();
    const [localTracks, setLocalTrack] = useState<ILocalAudioTrack | null>(null);

	const { getLocalAudioStream} = useLocalAudio();
	console.log(getLocalAudioStream(), 'local audio stream')
	const isAudioEnabled = useIsAudioEnabled();
	const connected = activeUids.includes(AI_AGENT_UID);
	console.log({ activeUids }, "active uids");
	const castedEngine = RtcEngineUnsafe as unknown as RtcEngine;

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
					name: "OpenAI" + (connected ? "" : " (disconnected)"),
					video: false,
				}}
				CustomChild={() =>
					connected ? <AudioVisualizer /> : <DisconnectedView />
				}
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
				<MaxVideoView user={defaultContent[localUid]} />
				<View style={{
					position:"absolute",
					width:100,
					height:50,
					bottom:16,
					right:16,
					backgroundColor: $config.VIDEO_AUDIO_TILE_COLOR

				}}>
				{localTracks && isAudioEnabled(localUid) && <ActiveSpeakerAnimation audioTrack={localTracks} isMuted={!isAudioEnabled(localUid)} />}
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
						component: LayoutComponentE,
					},
				];
			},
			topToolBar: Topbar,
			bottomToolBar: Bottombar,
		},
	},
});

export { AI_AGENT_UID };
export default customization;
