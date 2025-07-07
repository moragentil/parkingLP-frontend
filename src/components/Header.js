import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../utils/tailwind';
import sharedStyles from '../utils/sharedStyles'; 

export default function Header({ title }) {
  return (
    <View style={[tw`flex-row items-center justify-between bg-blue-500 pt-20 pb-6 px-4`, sharedStyles.bgCustomBlue]}>
      <TouchableOpacity>
        <Text style={tw`text-white text-2xl`}>☰</Text> 
      </TouchableOpacity>
      <Text style={tw`text-white text-xl font-bold`}>{title}</Text>
      <View style={tw`w-8`} /> 
    </View>
  );
}