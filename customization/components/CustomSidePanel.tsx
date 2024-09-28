import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CustomSidePanel = () => {
    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.textStyle}>
                    This is Custom Side Panel , Add sub components for device configuration and anis
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    textContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    textStyle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
    },
});

export default CustomSidePanel;
