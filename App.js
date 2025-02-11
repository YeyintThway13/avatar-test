import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Speech from 'expo-speech';

const App = () => {
  const didkey = "eWV5aW50dGh3YXk2NTZAZ21haWwuY29t:0o5PouE4ZdE_WBknyRqFn"

  const [avatarURL, setAvatarURL] = useState(
    'https://models.readyplayer.me/67aa1758b178c83b39d7d292.glb',
    // 'https://models.readyplayer.me/67962016903a9b0149b2ee08.glb' // Replace with your Ready Player Me avatar URL
  );
  const webviewRef = useRef(null);
  const paragraph =
    "Newspapers keep people informed about what is happening around the world. These changes make the avatar's lip movements more synchronized with the speech, creating a more natural and responsive lip-sync animation. The mouth movements are now faster and better matched to the voice timing.";

  useEffect(() => {
    // Initialize Text-to-Speech
    Speech.getAvailableVoicesAsync().then(voices => {
      console.log('Available voices:', voices);
    });
  }, []);

  const startLipSync = () => {
    const words = paragraph.split(' ');
    const phonemeMap = {
      'a': { viseme: 'viseme_aa', duration: 180, emphasis: 0.9 },
      'e': { viseme: 'viseme_E', duration: 160, emphasis: 0.85 },
      'i': { viseme: 'viseme_I', duration: 150, emphasis: 0.8 },
      'o': { viseme: 'viseme_O', duration: 180, emphasis: 0.9 },
      'u': { viseme: 'viseme_U', duration: 160, emphasis: 0.85 },
      'p': { viseme: 'viseme_PP', duration: 130, emphasis: 1.0 },
      'b': { viseme: 'viseme_PP', duration: 130, emphasis: 1.0 },
      'm': { viseme: 'viseme_PP', duration: 140, emphasis: 0.95 },
      'f': { viseme: 'viseme_FF', duration: 150, emphasis: 0.9 },
      'v': { viseme: 'viseme_FF', duration: 150, emphasis: 0.9 },
      't': { viseme: 'viseme_DD', duration: 120, emphasis: 1.0 },
      'd': { viseme: 'viseme_DD', duration: 120, emphasis: 1.0 },
      'k': { viseme: 'viseme_kk', duration: 130, emphasis: 0.95 },
      'g': { viseme: 'viseme_kk', duration: 130, emphasis: 0.95 },
      'ch': { viseme: 'viseme_CH', duration: 140, emphasis: 0.9 },
      'j': { viseme: 'viseme_CH', duration: 140, emphasis: 0.9 },
      's': { viseme: 'viseme_SS', duration: 160, emphasis: 0.85 },
      'z': { viseme: 'viseme_SS', duration: 160, emphasis: 0.85 },
      'n': { viseme: 'viseme_nn', duration: 140, emphasis: 0.8 },
      'r': { viseme: 'viseme_RR', duration: 150, emphasis: 0.85 },
      'th': { viseme: 'viseme_TH', duration: 170, emphasis: 0.9 }
    };

    const speechRate = 1.0;  // Increased speech rate
    const wordSpacing = 160;   // Reduced word spacing for faster transitions
    const transitionTime = 110; // Shorter transitions for quicker movement

    // Calculate total duration based on phoneme durations
    const totalDuration = words.reduce((total, word) => {
      const letters = word.split('');
      const wordDuration = letters.reduce((sum, letter) => {
        const phoneme = phonemeMap[letter] || phonemeMap['a'];
        return sum + (phoneme.duration * speechRate * 0.8); // Reduced timing factor further
      }, 0);
      return total + wordDuration + wordSpacing;
    }, 0);

    Speech.speak(paragraph, {
      language: 'en-US',
      rate: speechRate,
      pitch: 1.0,
      onStart: () => {
        webviewRef.current.postMessage(
          JSON.stringify({
            type: 'startLipSync',
            text: paragraph,
            phonemeMap,
            timing: {
              speechRate,
              wordSpacing,
              transitionTime,
              totalDuration
            }
          })
        );
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ready Player Me Avatar Lip Sync</Text>

      {/* WebView for displaying the 3D avatar */}
      <WebView
        ref={webviewRef}
        style={styles.webview}
        source={{
          html: `
            <!DOCTYPE html>
            <html lang="en">
              <head>
y                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">
                <meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp">
                <script async src="https://unpkg.com/es-module-shims@1.3.6/dist/es-module-shims.js"></script>
                <script type="importmap">
                  {
                    "imports": {
                      "three": "https://unpkg.com/three@0.172.0/build/three.module.js",
                      "three/addons/": "https://unpkg.com/three@0.172.0/examples/jsm/"
                    }
                  }
                </script>
                <script type="module">
                  import * as THREE from 'three';
                  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

                  let scene, camera, renderer, avatar;

                  function init() {
                    scene = new THREE.Scene();
                    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
                    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    renderer.setClearColor(0x1a1a2e, 1);
                    renderer.shadowMap.enabled = true;
                    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                    renderer.outputEncoding = THREE.sRGBEncoding;
                    renderer.toneMapping = THREE.ACESFilmicToneMapping;
                    renderer.toneMappingExposure = 1.0;
                    document.body.appendChild(renderer.domElement);

                    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
                    scene.add(ambientLight);
                    
                    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
                    directionalLight.position.set(1, 2, 1);
                    directionalLight.castShadow = true;
                    directionalLight.shadow.mapSize.width = 2048;
                    directionalLight.shadow.mapSize.height = 2048;
                    scene.add(directionalLight);

                    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
                    fillLight.position.set(-1, 0, -1);
                    scene.add(fillLight);

                    camera.position.z = 1;
                    camera.position.y = 0.6;

                    const loader = new GLTFLoader();
                    loader.load('${avatarURL}',
                      function (gltf) {
                        avatar = gltf.scene;
                        avatar.position.set(0, -0.4, 0);
                        avatar.scale.set(0.75, 0.75, 0.75);
                        avatar.traverse((node) => {
                          if (node.isMesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                          }
                        });
                        scene.add(avatar);
                        document.getElementById('loading').style.display = 'none';
                        animate();
                      },
                      function (xhr) {
                        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                      },
                      function (error) {
                        console.error('Error loading avatar:', error);
                        document.getElementById('loading').textContent = 'Error loading avatar';
                      }
                    );

                    window.addEventListener('resize', onWindowResize, false);
                  }

                  function onWindowResize() {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                  }
                  let time = 0;

                  function animate() {
                    requestAnimationFrame(animate);

                     if (avatar) {
                        time += 0.05;

                        let head = avatar.getObjectByName("Head");
                        if (head) {
                            head.rotation.x = Math.cos(time * 0.5) * 0.05;
                        }

                        let rightArm = avatar.getObjectByName("RightArm");
                        let leftArm = avatar.getObjectByName("LeftArm");

                       if (rightArm && leftArm) {
                          rightArm.rotation.x = 1.4 + Math.cos(time * 0.3) * 0.01;
                          leftArm.rotation.x = 1.4 + Math.cos(time * 0.3) * 0.01;
                        }  
                    }   
                    renderer.render(scene, camera);
                  }

                  function simulateLipSync(data) {
                    if (avatar) {
                      const { text, phonemeMap, timing } = data;
                      const words = text.toLowerCase().split(' ');
                      let currentTime = 0;

                      // Calculate total animation duration
                      const totalAnimationDuration = words.reduce((total, word) => {
                        return total + word.split('').reduce((sum, letter) => {
                          const phoneme = phonemeMap[letter] || phonemeMap['a'];
                          return sum + (phoneme.duration * timing.speechRate * 0.6);
                        }, 0) + timing.wordSpacing;
                      }, 0);

                      words.forEach((word, wordIndex) => {
                        const letters = word.split('');
                        letters.forEach((letter, letterIndex) => {
                          const phoneme = phonemeMap[letter] || phonemeMap['a'];
                          const delay = currentTime;
                          
                          setTimeout(() => {
                            if (avatar.traverse) {
                              avatar.traverse((node) => {
                                if (node.morphTargetDictionary && node.morphTargetInfluences) {
                                  const startValues = {};
                                  Object.keys(node.morphTargetDictionary).forEach(target => {
                                    startValues[target] = node.morphTargetInfluences[node.morphTargetDictionary[target]];
                                  });
                                  
                                  const animate = (progress) => {
                                    Object.keys(node.morphTargetDictionary).forEach(target => {
                                      const startValue = startValues[target];
                                      const endValue = target === phoneme.viseme ? (0.8 * phoneme.emphasis) : 0;
                                      node.morphTargetInfluences[node.morphTargetDictionary[target]] = 
                                        startValue + (endValue - startValue) * progress;
                                    });
                                  };
                                  
                                  const startTime = performance.now();
                                  const transition = () => {
                                    const now = performance.now();
                                    const progress = Math.min(1, (now - startTime) / timing.transitionTime);
                                    
                                    animate(progress);
                                    
                                    if (progress < 1) {
                                      requestAnimationFrame(transition);
                                    }
                                  };
                                  
                                  requestAnimationFrame(transition);
                                }
                              });
                            }
                          }, delay);
                          
                          currentTime += phoneme.duration * timing.speechRate * 0.25; // Further reduced timing factor for faster movement
                        });
                        currentTime += timing.wordSpacing; // Reduced word spacing multiplier
                      });
                      
                      // Reset mouth at the exact end of speech
                      setTimeout(() => {
                        if (avatar.traverse) {
                          avatar.traverse((node) => {
                            if (node.morphTargetDictionary && node.morphTargetInfluences) {
                              const startValues = {};
                              Object.keys(node.morphTargetDictionary).forEach(target => {
                                startValues[target] = node.morphTargetInfluences[node.morphTargetDictionary[target]];
                              });
                              
                              const animate = (progress) => {
                                Object.keys(node.morphTargetDictionary).forEach(target => {
                                  const startValue = startValues[target];
                                  node.morphTargetInfluences[node.morphTargetDictionary[target]] = 
                                    startValue * (1 - progress);
                                });
                              };
                              
                              const startTime = performance.now();
                              const resetTransition = () => {
                                const now = performance.now();
                                const progress = Math.min(1, (now - startTime) / timing.transitionTime);
                                
                                animate(progress);
                                
                                if (progress < 1) {
                                  requestAnimationFrame(resetTransition);
                                }
                              };
                              
                              requestAnimationFrame(resetTransition);
                            }
                          });
                        }
                      }, totalAnimationDuration);
                    }
                  }

                  window.addEventListener('message', (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'startLipSync') {
                      simulateLipSync(data);
                    }
                  });

                  init();
                </script>
              </head>
              <body style="margin: 0; overflow: hidden; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
                <style>
                  #loading {
                    color: #fff;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    font-size: 16px;
                    font-weight: 500;
                    background: rgba(0, 0, 0, 0.7);
                    padding: 15px 30px;
                    border-radius: 30px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  }
                </style>
               <div id="loading" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #333;">Loading avatar...</div>
                
              </body>
            </html>
          `,
        }}
        
        javaScriptEnabled={true}
        onMessage={(event) => {
          console.log('Message from WebView:', event.nativeEvent.data);
        }}
      />

      <TouchableOpacity style={styles.button} onPress={startLipSync}>
        <Text style={styles.buttonText}>Start Lip Sync</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  title: {
    marginTop: 50,
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  webview: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 10,
    marginHorizontal: 15,
  },
  button: {
    marginTop: 20,
    marginBottom: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default App;
