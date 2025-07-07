import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../utils/tailwind';
import sharedStyles from '../utils/sharedStyles'; 
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Header({ title, onMenuPress }) {
  return (
    <View style={[tw`flex-row items-center justify-between bg-blue-500 pt-12 pb-4 px-4`, sharedStyles.bgCustomBlue]}>
      <TouchableOpacity onPress={onMenuPress} style={tw`p-2`}>
        <Ionicons name="menu-outline" size={32} color="white" />
      </TouchableOpacity>
      <Text style={tw`text-white text-xl font-bold`}>{title}</Text>
      <View style={tw`w-8`} /> 
    </View>
  );
}