import RtcEngine from "bridge/rtc/webNg";
import { AI_AGENT_UID } from "..";
import { isMobileUA, useContent, useLocalUid, useRtc } from "customization-api";
import React, { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { LiveAudioVisualizer } from "./react-audio-visualize";
import { DisconnectedIconDesktop, DisconnectedIconMobile } from "./icons";


export const DisconnectedView = ({isConnected}) => {
	return (
		<View
			style={{
				flex: 1,
				backgroundColor: '#222',
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{/* big circle that covers the parent view */}
			{isMobileUA() ? <DisconnectedIconMobile /> : <DisconnectedIconDesktop />}
			<Text style={{color: '#B3B3B3', fontSize: 20, fontWeight: "400",marginTop: 20}}>{isConnected ? "" : "Not Joined"}</Text>
		</View>
	);
};
function createSilentAudioTrack() {
	const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

	const silentSource = audioContext.createBufferSource();
	const buffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
	const channel = buffer.getChannelData(0);
	channel[0] = 0; // Set the first (and only) sample to 0
	silentSource.buffer = buffer;
	silentSource.loop = true;

	const destination = audioContext.createMediaStreamDestination();

	silentSource.connect(destination);

	silentSource.start();

	const silentTrack = destination.stream.getAudioTracks()[0];

	return silentTrack;
}

const mediaStream = new MediaStream();
const emptyAudioTrack = createSilentAudioTrack();

mediaStream.addTrack(emptyAudioTrack);


const AudioVisualizer = ({audioTrack}) => { 

 return (
	<View
	style={{
		flex: 1,
		backgroundColor: '#222',
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	}}
>
<LiveAudioVisualizer
	audioTrack={audioTrack}
	width={300}
	height={400}
	fftSize={32}
	barWidth={10}
	minDecibels={-60}
	maxDecibels={-10}
	gap={2}
	backgroundColor="transparent"
	barColor="#00C2FF"
	smoothingTimeConstant={0.9}
	/>

</View>)

}


export default AudioVisualizer;
