import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Speech from 'expo-speech';

const App = () => {
  const [avatarURL, setAvatarURL] = useState(

    'https://models.readyplayer.me/6795e7e727249940cdc695af.glb' // Replace with your Ready Player Me avatar URL
  );
  const webviewRef = useRef(null);
  const paragraph =
    "Hello! I'm a 3D avatar powered by Ready Player Me. This is a demonstration of lip sync functionality using Expo and React Native.";

  useEffect(() => {
    // Initialize Text-to-Speech
    Speech.getAvailableVoicesAsync().then(voices => {
      console.log('Available voices:', voices);
    });
  }, []);

  const startLipSync = () => {
    // Speak the paragraph using Expo Speech
    Speech.speak(paragraph, {
      language: 'en-US',
      rate: 0.5
    });

    // Send a message to the WebView to trigger lip-sync animations
    webviewRef.current.postMessage(
      JSON.stringify({ type: 'startLipSync', text: paragraph })
    );
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
                    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    renderer.setClearColor(0xf0f0f0, 1);
                    document.body.appendChild(renderer.domElement);

                    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
                    scene.add(ambientLight);
                    
                    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
                    directionalLight.position.set(0, 1, 1);
                    scene.add(directionalLight);

                    camera.position.z = 1.6;
                    camera.position.y = 2.9;

                    const loader = new GLTFLoader();
                    loader.load('${avatarURL}',
                      function (gltf) {
                        avatar = gltf.scene;
                        avatar.position.set(0, -0.3, 0);
                        avatar.scale.set(2, 2, 2);
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

                  function animate() {
                    requestAnimationFrame(animate);
                    renderer.render(scene, camera);
                  }

                  function simulateLipSync() {
                    if (avatar) {
                      const morphTargets = ['viseme_PP', 'viseme_O', 'viseme_I'];
                      let currentIndex = 0;

                      const interval = setInterval(() => {
                        if (avatar.traverse) {
                          avatar.traverse((node) => {
                            if (node.morphTargetDictionary && node.morphTargetInfluences) {
                              morphTargets.forEach((target, index) => {
                                if (node.morphTargetDictionary[target] !== undefined) {
                                  node.morphTargetInfluences[node.morphTargetDictionary[target]] = 
                                    index === currentIndex ? 1 : 0;
                                }
                              });
                            }
                          });
                        }
                        currentIndex = (currentIndex + 1) % morphTargets.length;
                      }, 150);

                      setTimeout(() => clearInterval(interval), 5000);
                    }
                  }

                  window.addEventListener('message', (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'startLipSync') {
                      simulateLipSync();
                    }
                  });

                  init();
                </script>
              </head>
              <body style="margin: 0; overflow: hidden; background-color: #f0f0f0;">
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
    backgroundColor: '#f4f4f4',
  },
  title: {
    marginTop: 50,
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  webview: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default App;
