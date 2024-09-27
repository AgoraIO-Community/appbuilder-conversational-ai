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

export interface WrapperInterface {
	customKey1?: string;
	customKey2?: string;
}

interface WrapperProviderProps {
	children: React.ReactNode;
}

const WrapperProvider = (props: WrapperProviderProps) => {
	const { data } = useRoomInfo();
	const uid = useLocalUid();

	const { defaultContent, setCustomContent } = useContent();

	useEffect(() => {
		setCustomContent(10000, ({}) => (
			<MaxVideoView
				user={defaultContent[uid]}
				CustomChild={() => (
					<UiKitMaxVideoView
						user={defaultContent[uid]}
						fallback={() =>
							FallbackLogo(
								defaultContent[uid].name as string,
								false,
								false,
								true,
								100,
							)
						}
					/>
				)}
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
