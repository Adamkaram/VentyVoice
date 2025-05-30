'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Volume2, Languages, Smile, Heart, Frown, Flame, Coffee } from 'lucide-react';
import { SnakeBorderTextarea } from "@/components/ui/snake-border-textarea"
type Voice = {
  voice_id: string;
  name: string;
};

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'pl', name: 'Polish' },
  { code: 'hi', name: 'Hindi' }
];

const emotions = [
  { id: 'excited', name: 'Excited', icon: Flame, color: 'text-orange-500' },
  { id: 'happy', name: 'Happy', icon: Smile, color: 'text-yellow-500' },
  { id: 'calm', name: 'Calm', icon: Coffee, color: 'text-blue-500' },
  { id: 'sad', name: 'Sad', icon: Frown, color: 'text-purple-500' },
  { id: 'loving', name: 'Loving', icon: Heart, color: 'text-pink-500' }
];

const transitionProps = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.5,
};

export default function Page() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedEmotion, setSelectedEmotion] = useState('neutral');
  const [step, setStep] = useState<'language' | 'voice' | 'emotion' | 'text'>('language');
  const [error, setError] = useState('');
  const [isTextModified, setIsTextModified] = useState(false);
  const [lastGeneratedText, setLastGeneratedText] = useState('');

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    setIsTextModified(newText !== lastGeneratedText);
  };

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoadingVoices(true);
        const response = await fetch('/api/voices');
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (data.voices) {
          setVoices(data.voices);
          if (data.voices.length > 0) {
            setSelectedVoice(data.voices[0].voice_id);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch voices');
        setStep('language');
      } finally {
        setLoadingVoices(false);
      }
    };

    fetchVoices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isTextModified && audioUrl) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl('');
      }

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text, 
          voice_id: selectedVoice,
          language: selectedLanguage,
          emotion: selectedEmotion
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert text to speech');
      }

      const data = await response.blob();
      const url = URL.createObjectURL(data);
      setAudioUrl(url);
      setLastGeneratedText(text);
      setIsTextModified(false);
    } catch (error: any) {
      setError(error.message || 'An error occurred');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'language':
        return (
          <>
            <h1 className="text-white text-3xl font-semibold mb-12 text-center flex items-center justify-center gap-3">
              <Languages className="w-8 h-8" />
              Select Your Language
            </h1>
            <motion.div 
              className="flex flex-wrap gap-3 justify-center"
              layout
              transition={transitionProps}
            >
              {languages.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <motion.button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      if (!loadingVoices && voices.length > 0) {
                        setStep('voice');
                      }
                    }}
                    disabled={loadingVoices}
                    layout
                    initial={false}
                    animate={{
                      backgroundColor: isSelected ? "#2a1711" : "rgba(39, 39, 42, 0.5)",
                      opacity: loadingVoices ? 0.5 : 1
                    }}
                    whileHover={{
                      backgroundColor: isSelected ? "#2a1711" : "rgba(39, 39, 42, 0.8)",
                      scale: loadingVoices ? 1 : 1.05
                    }}
                    whileTap={{ scale: loadingVoices ? 1 : 0.95 }}
                    transition={transitionProps}
                    className={`
                      inline-flex items-center px-4 py-2 rounded-full text-base font-medium
                      whitespace-nowrap overflow-hidden ring-1 ring-inset
                      ${isSelected 
                        ? "text-[#ff9066] ring-[hsla(0,0%,100%,0.12)]" 
                        : "text-zinc-400 ring-[hsla(0,0%,100%,0.06)]"}
                      ${loadingVoices ? "cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    <motion.div className="relative flex items-center gap-2">
                      <span>{lang.name}</span>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={transitionProps}
                          >
                            <div className="w-4 h-4 rounded-full bg-[#ff9066] flex items-center justify-center">
                              <Check className="w-3 h-3 text-[#2a1711]" strokeWidth={1.5} />
                            </div>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.button>
                );
              })}
            </motion.div>
            {loadingVoices && (
              <p className="text-zinc-400 text-center mt-4">Loading voices...</p>
            )}
            {error && (
              <p className="text-red-500 text-center mt-4">{error}</p>
            )}
          </>
        );

      case 'voice':
        return (
          <>
            <h1 className="text-white text-3xl font-semibold mb-12 text-center flex items-center justify-center gap-3">
              <Volume2 className="w-8 h-8" />
              Choose Your Voice
            </h1>
            <motion.div 
              className="flex flex-wrap gap-3 justify-center"
              layout
              transition={transitionProps}
            >
              {voices.map((voice) => {
                const isSelected = selectedVoice === voice.voice_id;
                return (
                  <motion.button
                    key={voice.voice_id}
                    onClick={() => {
                      setSelectedVoice(voice.voice_id);
                      setStep('emotion');
                    }}
                    layout
                    initial={false}
                    animate={{
                      backgroundColor: isSelected ? "#2a1711" : "rgba(39, 39, 42, 0.5)",
                    }}
                    whileHover={{
                      backgroundColor: isSelected ? "#2a1711" : "rgba(39, 39, 42, 0.8)",
                      scale: 1.05
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={transitionProps}
                    className={`
                      inline-flex items-center px-4 py-2 rounded-full text-base font-medium
                      whitespace-nowrap overflow-hidden ring-1 ring-inset
                      ${isSelected 
                        ? "text-[#ff9066] ring-[hsla(0,0%,100%,0.12)]" 
                        : "text-zinc-400 ring-[hsla(0,0%,100%,0.06)]"}
                    `}
                  >
                    <motion.div className="relative flex items-center gap-2">
                      <span>{voice.name}</span>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={transitionProps}
                          >
                            <div className="w-4 h-4 rounded-full bg-[#ff9066] flex items-center justify-center">
                              <Check className="w-3 h-3 text-[#2a1711]" strokeWidth={1.5} />
                            </div>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.button>
                );
              })}
            </motion.div>
            <motion.button
              onClick={() => setStep('language')}
              className="mx-auto block text-zinc-400 hover:text-zinc-300 transition-colors mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ← Back to Language Selection
            </motion.button>
          </>
        );

      case 'emotion':
        return (
          <>
            <h1 className="text-white text-3xl font-semibold mb-12 text-center flex items-center justify-center gap-3">
              <Smile className="w-8 h-8" />
              Choose the Emotion
            </h1>
            <motion.div 
              className="flex flex-wrap gap-4 justify-center"
              layout
              transition={transitionProps}
            >
              {emotions.map((emotion) => {
                const isSelected = selectedEmotion === emotion.id;
                const Icon = emotion.icon;
                return (
                  <motion.button
                    key={emotion.id}
                    onClick={() => {
                      setSelectedEmotion(emotion.id);
                      setStep('text');
                    }}
                    layout
                    initial={false}
                    animate={{
                      backgroundColor: isSelected ? "#2a1711" : "rgba(39, 39, 42, 0.5)",
                    }}
                    whileHover={{
                      backgroundColor: isSelected ? "#2a1711" : "rgba(39, 39, 42, 0.8)",
                      scale: 1.05
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={transitionProps}
                    className={`
                      inline-flex flex-col items-center px-6 py-4 rounded-xl text-base font-medium
                      gap-2 ${isSelected ? "text-[#ff9066]" : "text-zinc-400"}
                      ring-1 ring-inset ${isSelected ? "ring-[hsla(0,0%,100%,0.12)]" : "ring-[hsla(0,0%,100%,0.06)]"}
                    `}
                  >
                    <Icon className={`w-8 h-8 ${emotion.color}`} />
                    <span>{emotion.name}</span>
                  </motion.button>
                );
              })}
            </motion.div>
            <motion.button
              onClick={() => setStep('voice')}
              className="mx-auto block text-zinc-400 hover:text-zinc-300 transition-colors mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ← Back to Voice Selection
            </motion.button>
          </>
        );

      case 'text':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionProps}
            className="space-y-6"
          >
            <h1 className="text-white text-3xl font-semibold text-center">Enter Your Text</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <SnakeBorderTextarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder={`Enter text in ${languages.find(l => l.code === selectedLanguage)?.name}...`}
                  rows={6}
                  required
                />
              </div>
              
              <motion.button
                type="submit"
                disabled={Boolean(loading || !selectedVoice || (!isTextModified && audioUrl))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-6 bg-[#ff9066] text-black rounded-lg font-medium hover:bg-[#ff7f4d] disabled:opacity-50 disabled:hover:bg-[#ff9066] transition-colors"
              >
                {loading ? 'Converting...' : isTextModified ? 'Convert to Speech' : audioUrl ? 'Already Generated' : 'Convert to Speech'}
              </motion.button>

              <motion.button
                onClick={() => setStep('emotion')}
                className="mx-auto block text-zinc-400 hover:text-zinc-300 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                ← Back to Emotion Selection
              </motion.button>
            </form>

            {error && (
              <p className="text-red-500 text-center mt-4">{error}</p>
            )}

            {audioUrl && (
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, ...transitionProps }}
              >
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </motion.div>
            )}
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 pt-20">
      <motion.div 
        className="max-w-2xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitionProps}
      >
        {renderStep()}
      </motion.div>
    </div>
  );
} 