import React from 'react';
import { motion } from 'framer-motion';
import { ASSISTANTS } from './assistantConfig';
import { AssistantType } from './types';

interface AssistantSelectorProps {
  onSelectAssistant: (type: AssistantType) => void;
}

export default function AssistantSelector({ onSelectAssistant }: AssistantSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full overflow-y-auto pb-16">
      {ASSISTANTS.map((assistant, index) => (
        <motion.div
          key={assistant.type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
          onClick={() => onSelectAssistant(assistant.type)}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-full text-blue-600 dark:text-blue-400 shadow text-2xl">
              {assistant.icon}
            </div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
              {assistant.name}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {assistant.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
}