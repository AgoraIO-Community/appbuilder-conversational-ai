import {
	customize,
	MaxVideoView,
	useContent,
	useLocalUid,
	useRecording,
	useRoomInfo,
	UiKitMaxVideoView,
} from "customization-api";
import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import FallbackLogo from "./components/FallbackLogo";
import AudioVisualizer from "./components/AudioVisualizer";

export interface WrapperInterface {
	customKey1?: string;
	customKey2?: string;
}

interface WrapperProviderProps {
	children: React.ReactNode;
}

export const AI_AGENT_UID = 111123456;

const WrapperProvider = (props: WrapperProviderProps) => {
	const { data } = useRoomInfo();
	const uid = useLocalUid();

	const { defaultContent, setCustomContent } = useContent();

	useEffect(() => {
		setCustomContent(AI_AGENT_UID, ({}) => (
			<MaxVideoView
				user={{ ...defaultContent[uid], name: "Ai-Agent", video: false }}
				CustomChild={() => <AudioVisualizer />}
			/>
		));
	}, [data]);
	return <>{props.children}</>;
};

const customization = customize({
	components: {
		videoCall: {
			wrapper: WrapperProvider,
		},
	},
});

export default customization;
