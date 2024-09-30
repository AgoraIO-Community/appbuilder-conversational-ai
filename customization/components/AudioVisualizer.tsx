import RtcEngine from "bridge/rtc/webNg";
import { AI_AGENT_UID } from "..";
import { useContent, useLocalUid, useRtc } from "customization-api";
import React, { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { LiveAudioVisualizer } from "./react-audio-visualize";

export const DisconnectedView = () => {
	return (
		<View
			style={{
				flex: 1,
				backgroundColor: $config.CARD_LAYER_1_COLOR,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{/* big circle that covers the parent view */}
			<svg
				width="500"
				height="500"
				viewBox="0 0 500 500"
				fill="#00C2FF"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle
					cx="250"
					cy="250"
					r="200"
					stroke="#00C2FF"
					stroke-width="40"
					fill="transparent"
				/>
			</svg>
		</View>
	);
};

function createSilentAudioTrack() {
	const audioContext = new (window.AudioContext || window.webkitAudioContext)();

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

const AudioVisualizer = (props) => {
	const mediaStreamRef = useRef<MediaStream>(mediaStream);
	const mediaRecorderRef = useRef<MediaRecorder>(
		new MediaRecorder(mediaStreamRef.current),
	);
	const { RtcEngineUnsafe } = useRtc();
	const local = useLocalUid();
	const { activeUids } = useContent();
	const castedEngine = RtcEngineUnsafe as unknown as RtcEngine;

	useEffect(() => {
		// const uid = activeUids.filter(
		// 	(uid) => uid !== AI_AGENT_UID && uid !== local,
		// )[0];

		const uid = AI_AGENT_UID;

		const track = castedEngine.remoteStreams
			.get(uid)
			?.audio?.getMediaStreamTrack();

		// const track = castedEngine.localStream.audio?.getMediaStreamTrack();

		if (mediaStreamRef.current.getTracks().length > 0) {
			mediaStreamRef.current.removeTrack(mediaStreamRef.current.getTracks()[0]);
		}
		if (track) {
			console.log("track", mediaStreamRef.current.getTracks());
			mediaStreamRef.current.addTrack(track);
		} else {
			console.log("empty track");
			mediaStreamRef.current.addTrack(emptyAudioTrack);
		}
		if (mediaRecorderRef.current.state !== "recording") {
			mediaRecorderRef.current.start();
		}
	}, [RtcEngineUnsafe, activeUids]);

	return (
		<>
			<View
				style={{
					flex: 1,
					backgroundColor: $config.CARD_LAYER_1_COLOR,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<LiveAudioVisualizer
					mediaRecorder={mediaRecorderRef.current}
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
			</View>
		</>
	);
};
export default AudioVisualizer;
