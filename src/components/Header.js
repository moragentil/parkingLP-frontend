import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../utils/tailwind';
import sharedStyles from '../utils/sharedStyles'; 
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Header({ title, onMenuPress }) {
  return (
    <View style={[tw`flex-row items-center justify-between bg-blue-500 pt-16 pb-4 px-4`, sharedStyles.bgCustomBlue, { position: 'relative' }]}>
      <TouchableOpacity onPress={onMenuPress} style={tw`p-2 z-10`}>
        <Ionicons name="menu-outline" size={32} color="white" />
      </TouchableOpacity>
      <Text
        style={[
          tw`text-white pt-11 text-xl font-bold`,
          {
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 0,
          },
        ]}
      >
        {title}
      </Text>
      <View style={tw`w-8`} />
    </View>
  );
}