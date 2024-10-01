import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { ILocalAudioTrack } from 'agora-rtc-sdk-ng';
import {
    MaxVideoView,
    useContent,
    useLocalUid,
    LayoutComponent,
    useRtc,
    useLocalAudio,
    useIsAudioEnabled,
} from "customization-api";
import AudioVisualizer, { DisconnectedView } from "../AudioVisualizer";
import { AI_AGENT_UID } from "../AgentControls/const";
import {ActiveSpeakerAnimation } from "../../components/LocalAudioWave"

const MobileLayoutComponent: LayoutComponent = () => {
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
				<MaxVideoView user={defaultContent[localUid]} avatarRadius={48} hideMenuOptions={true} />
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

export default MobileLayoutComponent;