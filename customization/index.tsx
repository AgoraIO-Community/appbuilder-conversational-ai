import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import {
	customize,
	MaxVideoView,
	useContent,
	useLocalUid,
	LayoutComponent,
} from "customization-api";
import AudioVisualizer, {
	DisconnectedView,
} from "./components/AudioVisualizer";
import Bottombar from './components/Bottombar'
import CustomCreate from './components/CustomCreate'
import {AI_AGENT_UID} from "./components/AgentControls/const"

const Topbar = () => {
	return null;
};

const LayoutComponentE: LayoutComponent = () => {
	const localUid = useLocalUid();
	const { defaultContent, activeUids } = useContent();

	const connected = activeUids.includes(AI_AGENT_UID);
	console.log({ activeUids }, "active uids");

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
					name: "Ai-Agent" + (connected ? "" : " (disconnected)"),
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
