import RtcEngine from "bridge/rtc/webNg";
import { AI_AGENT_UID } from "..";
import { useContent, useIsHost, useLocalUid, useRtc } from "customization-api";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { LiveAudioVisualizer } from "./react-audio-visualize";
import { actionTypeGuard } from "agora-rn-uikit/src/Utils/actionTypeGuard";

const AudioVisualizer = (props) => {
	const mediaStreamRef = useRef<MediaStream>(new MediaStream());
	const { RtcEngineUnsafe } = useRtc();
	const local = useLocalUid();
	const { activeUids } = useContent();
	const castedEngine = RtcEngineUnsafe as unknown as RtcEngine;
	const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();

	useEffect(() => {
		// const [uid] = activeUids.filter(
		// 	(uid) => uid !== local && uid !== AI_AGENT_UID,
		// );

    const uid = AI_AGENT_UID

		// const track = castedEngine.localStream.audio?.getMediaStreamTrack();

		const track = castedEngine.remoteStreams
			.get(uid)
			?.audio?.getMediaStreamTrack();

		if (track) {
			console.log("[AI VISUALIER]:Got track", track);
			if (mediaStreamRef.current.getTracks().length > 0) {
				mediaStreamRef.current.removeTrack(
					mediaStreamRef.current.getTracks()[0],
				);
			}
			mediaStreamRef.current.addTrack(track);
			const mediaRecorder = new MediaRecorder(mediaStreamRef.current);
			mediaRecorder.start();
			setMediaRecorder(mediaRecorder);
		} else {
			console.log("[AI VISUALIER]:No track", uid, activeUids);
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
				{mediaRecorder?.state === "recording" ? (
					<LiveAudioVisualizer
						mediaRecorder={mediaRecorder}
						width={200}
						height={200}
						fftSize={32}
						barWidth={10}
						minDecibels={-60}
						maxDecibels={-10}
						gap={2}
						backgroundColor="transparent"
						barColor="white"
						smoothingTimeConstant={0.8}
					/>
				) : (
					<Text
						style={{
							color: "white",
							fontSize: 20,
						}}
					>
						Disconnected
					</Text>
				)}
			</View>
		</>
	);
};
export default AudioVisualizer;
