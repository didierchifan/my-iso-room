import React, { useRef, useMemo, useState, useEffect } from "react";
import { useThree, useFrame, extend } from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  useCursor,
  Html,
  shaderMaterial,
} from "@react-three/drei";

import * as THREE from "three";

//description 3d openere
import DescriptionOpenerOrange from "./Components/3dButtonOrange";
import DescriptionOpenerGreen from "./Components/3dButtonGreen";

//shaders import
import portalVertexShader from "./shaders/portal/vertex.glsl";
import portalFragmentShader from "./shaders/portal/fragment.glsl";

const PortalMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new THREE.Color("#00b2ff"),
    uColorEnd: new THREE.Color("#ebbee2"),
  },
  portalVertexShader,
  portalFragmentShader
);

extend({ PortalMaterial: PortalMaterial });

function useLoadedTexture() {
  const loadedTexture = useTexture("/model/baked.jpg");
  if (loadedTexture) {
    loadedTexture.colorSpace = THREE.SRGBColorSpace; // Set the correct encoding
    loadedTexture.flipY = "false";
  }
  return loadedTexture;
}

///////MAIN FUNCTION///////

export function Model({ cameraControlsRef, ...props }) {
  //loading the model
  const { nodes, materials } = useGLTF("/model/room-components.glb");

  //load texture calling the custom hook
  const loadedTexture = useLoadedTexture();

  const bakedTexture = useMemo(() => {
    return new THREE.MeshStandardMaterial({ map: loadedTexture });
  });

  //make sure the texture is properly loaded before rendering the model
  if (!loadedTexture) return null;

  //change cursor on hover
  const [hovered, set] = useState();

  const [isSeated, setIsSeated] = useState(null);

  useCursor(hovered);

  //referinta catre meshul pe care vreau sa fac boxfit
  const meshRef = useRef();

  //chair animation
  const topChairRef = useRef();

  useFrame((state, delta) => {
    const frequency = 1; // Adjust the frequency of oscillation
    const magnitude = -2; // Adjust the magnitude of rotation

    const rotationDelta =
      Math.sin(state.clock.elapsedTime * frequency) * magnitude * delta * 0.3;

    topChairRef.current.rotation.y += rotationDelta * 0.8;
  });

  const portalMaterial = useRef();
  useFrame((state, delta) => {
    portalMaterial.current.uTime += delta;
  });

  ///////////ACTIVE DESCRIPTION STATE//////////////
  const [activeToolTip, setActiveTooltip] = useState(null);

  const handleActiveToolTip = (id) => {
    if (activeToolTip === id) {
      setActiveTooltip(null);
    } else {
      setActiveTooltip(id);
    }
  };

  // -------------------- handle click outside tooltip\

  const handleDocumentClick = () => {
    if (activeToolTip) {
      setActiveTooltip(null);
    }
  };
  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [activeToolTip]);

  // -------------------- handle sit down up
  useEffect(() => {
    if (isSeated === null) {
      //do nothing
    } else if (!isSeated) {
      cameraControlsRef.current?.reset(true);
      // cameraControlsRef.current?.setPosition(1, 1, 2.5, true);
    } else {
      cameraControlsRef.current?.fitToBox(meshRef.current).then(() => {
        cameraControlsRef.current?.setPosition(-6.9, 2.3, -0.5, true);
      });
    }
  }, [isSeated]);

  /////////////CLICK TO ZOOM ON OBJECT//////////////
  const handleClickChair = () => {
    setIsSeated(!isSeated);
  };

  const handleClickDesk = () => {
    if (isSeated) setIsSeated(!isSeated);
  };

  return (
    <group {...props} dispose={null}>
      {/* tv screen shader material  */}
      <mesh position={[-0.257, 1.248, -1.838]}>
        <planeGeometry args={[1.29, 0.78]} />
        <portalMaterial ref={portalMaterial} />
      </mesh>

      {/* down | irlo painting */}

      <mesh
        geometry={nodes.paintingIrlo.geometry}
        material={bakedTexture}
        position={[1.986, 1.638, -0.502]}
      >
        {activeToolTip != "irlo" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("irlo")}
          >
            <DescriptionOpenerGreen position={[-0.1, 0.85, 0]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("irlo")}
          >
            <DescriptionOpenerOrange position={[-0.1, 0.85, 0]} />
          </mesh>
        )}

        <Html
          center
          position={[0, 1.1, 0]}
          wrapperClass={activeToolTip === "irlo" ? "label" : "hidden"}
          distanceFactor={0.003}
        >
          COPS AND GRAFITTI ARTISTS <br />
          146 x 146 cm <br />
          by Romanian Contemporary Artist, IRLO
        </Html>
      </mesh>
      {/* up | irlo painting */}

      {/* DESK GROUP FOR CLICK TO ZOOM */}

      <group onClick={handleClickDesk} ref={meshRef}>
        {/* displays with iframe on it */}
        <mesh
          position-x={1.5}
          position-y={1.1}
          position-z={-0.5}
          rotation={[0, 0, 0]}
          visible={false}
        >
          <boxGeometry args={[0.7, 0.8, 1.2]} />
          <meshStandardMaterial color={"red"} />
        </mesh>
        {/* macbook */}
        <mesh
          geometry={nodes.macbookScreen.geometry}
          material={new THREE.MeshBasicMaterial({ color: "black" })}
          position={[1.551, 0.885, -0.502]}
          rotation={[Math.PI / 2, -0.254, Math.PI / 2]}
        >
          <Html
            transform
            wrapperClass="htmlLaptopScreen"
            distanceFactor={0.107}
            position={[0, 0, -0.001]}
            rotation-x={-1.57}
          >
            <div wrapperClass="iframe--div">
              <iframe src="https://punctoranj.ro/" />
            </div>
          </Html>
        </mesh>
        {/* monitor */}
        <mesh
          geometry={nodes.monitorScreen.geometry}
          material={new THREE.MeshBasicMaterial({ color: "black" })}
          position={[1.773, 0.943, -0.502]}
          rotation={[0, 1.571, 0]}
        >
          <Html
            transform
            wrapperClass="htmlScreen"
            distanceFactor={0.19}
            position={[0.0, 0.241, -0.03]}
            rotation-x={Math.PI}
            rotation-z={Math.PI}
            flipZ="true"
          >
            <iframe src="https://iso-room.netlify.app/" />
          </Html>
        </mesh>
        {/* displays with iframe on it */}
        <mesh
          geometry={nodes.appleMacbookpro.geometry}
          material={bakedTexture}
          position={[1.449, 0.782, -0.502]}
          rotation={[0, -1.571, 0]}
        />
        {/* ipad
        <mesh
          geometry={nodes.ipadScreen.geometry}
          material={new THREE.MeshBasicMaterial({ color: "black" })}
          position={[1.438, 0.997, -0.04]}
          rotation={[0, 0, 1.194]}
        />
        <mesh
          geometry={nodes.appleIpad.geometry}
          material={bakedTexture}
          position={[1.444, 0.997, -0.042]}
          rotation={[0, 0, 1.194]}
        />
        <mesh
          geometry={nodes.appleIphone.geometry}
          material={bakedTexture}
          position={[1.437, 0.93, -0.862]}
          rotation={[0, 0, 1.288]}
        /> */}
        <mesh
          geometry={nodes.appleMonitor.geometry}
          material={bakedTexture}
          position={[1.773, 0.943, -0.502]}
          rotation={[0, 1.571, 0]}
        />
      </group>
      {/* up| DESK GROUP FOR CLICK TO ZOOM */}

      <mesh
        geometry={nodes.plantVase.geometry}
        material={bakedTexture}
        position={[1.705, 0.81, -1.02]}
        scale={0.077}
      ></mesh>

      {/* down| OBJECT WITH DESCRIPTIONS */}
      <mesh
        onClick={handleClickChair}
        ref={topChairRef}
        geometry={nodes.eamsChair.geometry}
        material={bakedTexture}
        position={[0.85, 0.556, -0.515]}
        onPointerOver={() => set(true)}
        onPointerOut={() => set(false)}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.eamsChairBottom.geometry}
        material={bakedTexture}
        position={[0.916, 0.046, -0.514]}
      />
      {/* iphone */}
      {/* <mesh
        geometry={nodes.iphoneScreen.geometry}
        material={bakedTexture}
        position={[1.427, 0.893, -0.862]}
        rotation={[0, 0, 1.288]}
      ></mesh> */}
      {/* tv description*/}

      <mesh
        geometry={nodes.tv.geometry}
        material={bakedTexture}
        position={[-0.257, 1.248, -1.841]}
      >
        {activeToolTip != "tv" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("tv")}
          >
            <DescriptionOpenerGreen position={[0, 0.5, 0]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("tv")}
          >
            <DescriptionOpenerOrange position={[0, 0.5, 0]} />
          </mesh>
        )}

        <Html
          center
          position={[0, 1, 0]}
          wrapperClass={activeToolTip === "tv" ? "label" : "hidden"}
          distanceFactor={0.003}
        >
          PHILIPS AMBILIGHT OLED 55OLED707 <br />
          <br />
          Currently watching: The Sopranos <br />
          <br />
          Favourite TV Shows: Bojack Horseman, Boardwalk Empire <br />
          <br />
          Favourite Movie: Forest Gump <br />
          <br />
          Favourite Actor: Steve Buscemi
        </Html>
      </mesh>

      {/* up | tv */}
      {/* down | couch area */}
      <mesh
        geometry={nodes.ikeaBedsideTable.geometry}
        material={bakedTexture}
        position={[-1.849, 0.097, 1.422]}
        rotation={[0, Math.PI / 2, 0]}
      >
        {activeToolTip != "ikeared" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("ikeared")}
          >
            <DescriptionOpenerGreen position={[0, 0.5, 0.5]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("ikeared")}
          >
            <DescriptionOpenerOrange position={[0, 0.5, 0.5]} />

            <Html
              center
              position={[0, 0.8, 0.5]}
              wrapperClass={activeToolTip === "ikeared" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              IKEA SÖDERHAMN couch
              <br /> IKEA SELJE bedside table <br /> APPLE TV remote <br />{" "}
              FAVOURITE CUP full of coffee
            </Html>
          </mesh>
        )}
      </mesh>
      <mesh
        geometry={nodes.appleRemote.geometry}
        material={bakedTexture}
        position={[-1.862, 0.541, 1.347]}
        rotation={[0, 0.093, 0]}
      />
      <mesh
        geometry={nodes.sofa.geometry}
        material={bakedTexture}
        position={[0.087, 0.65, 2.024]}
        rotation={[1.889, 0, 0]}
        scale={[0.401, 0.221, 0.276]}
      />
      <mesh
        geometry={nodes.cup.geometry}
        material={bakedTexture}
        position={[-1.771, 0.568, 1.355]}
      />
      {/* up | couch area */}
      {/* down | bookshelf area */}
      <mesh
        geometry={nodes.enetriShelf.geometry}
        material={bakedTexture}
        position={[-2.021, 0.829, -0.526]}
      >
        {activeToolTip != "enetri" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("enetri")}
          >
            <DescriptionOpenerGreen position={[0, 0.8, 0]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("enetri")}
          >
            <DescriptionOpenerOrange position={[0, 0.8, 0]} />

            <Html
              center
              position={[0, 1.2, 0]}
              wrapperClass={activeToolTip === "enetri" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              IKEA VINTAGE ENETRI SHELF
              <br /> IKEA ACKJA LAMP <br /> PROJECT-PARA SCULPTURE -
              <span>&#8203;</span>
              <a wrapperclass="link" href="https://www.project-para.com/">
                site
              </a>
              -
              <br /> RANDOM BOOKS that I never finished reading
            </Html>
          </mesh>
        )}
      </mesh>
      <mesh
        geometry={nodes.ikeaLamp.geometry}
        material={bakedTexture}
        position={[-2.057, 1.536, -0.356]}
      />
      <mesh
        geometry={nodes.enetriBooks.geometry}
        material={bakedTexture}
        position={[-2.03, 0.566, -0.487]}
        rotation={[0, 1.571, 0]}
      >
        {activeToolTip != "snowboard" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("snowboard")}
          >
            <DescriptionOpenerGreen position={[1.45, 1.68, 0.14]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("snowboard")}
          >
            <DescriptionOpenerOrange position={[1.45, 1.68, 0.14]} />

            <Html
              center
              position={[1.2, 2.2, 0]}
              wrapperClass={activeToolTip === "snowboard" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              Snowboarding Setup: <br />
              board: BATELEON EVIL TWIN <br />
              bindings: UNION ULTRA <br />
              boots: DEELUXE EMPIRE <br />
              <br />
              SEE YOU ON THE SLOPES!
              <br />
            </Html>
          </mesh>
        )}
      </mesh>
      <mesh
        geometry={nodes.decor.geometry}
        material={bakedTexture}
        position={[-2.017, 0.75, -0.337]}
        rotation={[0, 0.426, 0]}
      />
      {/* up | bookshelf area */}
      {/* down | ikea donut */}
      <mesh
        geometry={nodes.ikeaDonut.geometry}
        material={bakedTexture}
        position={[-1.326, 1.924, -1.933]}
        rotation={[Math.PI / 2, 0, 0]}
      ></mesh>
      {/* up | ikea donut */}
      {/* down | snowboarding setup */}
      <mesh
        geometry={nodes.bataleon.geometry}
        material={bakedTexture}
        position={[-1.902, 1.325, -1.963]}
        rotation={[Math.PI / 2, Math.PI / 2, 0]}
      ></mesh>
      {/* up | snowboarding setup */}
      {/* down | chessboard  */}
      <mesh
        geometry={nodes.chessBoard002.geometry}
        material={bakedTexture}
        position={[1.199, 1.768, -1.939]}
        rotation={[1.432, 0, 0]}
      ></mesh>
      <mesh
        geometry={nodes.chessBoard.geometry}
        material={bakedTexture}
        position={[1.199, 1.768, -1.939]}
        rotation={[1.432, 0, 0]}
      />
      {/* up | chessboard  */}
      {/* down | chessbooks */}
      <mesh
        geometry={nodes.booksChess.geometry}
        material={bakedTexture}
        position={[1.356, 1.243, -1.708]}
      >
        {activeToolTip != "chessbooks" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("chessbooks")}
          >
            <DescriptionOpenerGreen position={[0, 0.1, 0]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("chessbooks")}
          >
            <DescriptionOpenerOrange position={[0, 0.1, 0]} />

            <Html
              center
              position={[0, 0.5, 0]}
              wrapperClass={activeToolTip === "chessbooks" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              FAVOURITE CHESS BOOKS: <br />
              The Woodpecker Method | Art of Attack in Chess | Amateur to IM |
              Simple Chess | Chess Structures | Mayhem in the Morra |
              Dvoretsky's Endgame Manual | 100 Endgames You Must Know <br />
              <br />
              Play with me on Lichess: @ddrchf
            </Html>
          </mesh>
        )}
      </mesh>
      {/* up | chessbooks */}

      {/* down | architecture books */}
      <mesh
        geometry={nodes.booksArchitecture.geometry}
        material={bakedTexture}
        position={[1.216, 0.924, -1.707]}
      >
        {activeToolTip != "architecture" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("architecture")}
          >
            <DescriptionOpenerGreen position={[0.4, 0, 0.15]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("architecture")}
          >
            <DescriptionOpenerOrange position={[0.4, 0, 0.15]} />

            <Html
              center
              position={[0.4, 0.33, 0.15]}
              wrapperClass={
                activeToolTip === "architecture" ? "label" : "hidden"
              }
              distanceFactor={0.003}
            >
              Favourite Architecture Books: <br />
              Modern Architecture: A Critical History by KENNETH FRAMPTON <br />
              Remarks on 21 Works by RAFAEL MONEO <br />
              Notations by BERNARD TSCHUMI
            </Html>
          </mesh>
        )}
      </mesh>
      {/* up | architecture books */}

      {/* down | philosofy,biofrafy books */}
      <mesh
        geometry={nodes.booksPhilosofy.geometry}
        material={bakedTexture}
        position={[1.178, 0.54, -1.708]}
      >
        {activeToolTip != "books" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("books")}
          >
            <DescriptionOpenerGreen position={[-0.1, 0.05, 0]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("books")}
          >
            <DescriptionOpenerOrange position={[-0.1, 0.05, 0]} />

            <Html
              center
              position={[-0.1, 0.45, 0]}
              wrapperClass={activeToolTip === "books" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              Favourite philosophy books: <br />A Brief History of Thought by
              Luc Ferry <br /> Meditations by Marcus Aurelius <br />
              <br /> Favourite biography books: <br /> The Innovators by Walter
              Isaacson <br /> Steve Jobs by Walter Isaacson
            </Html>
          </mesh>
        )}
      </mesh>
      <mesh
        geometry={nodes.booksBiographies.geometry}
        material={bakedTexture}
        position={[1.167, 0.201, -1.708]}
      />
      {/* up | philosofy, biography books  */}

      {/* down | turntable  */}
      <mesh
        geometry={nodes.turntable.geometry}
        material={bakedTexture}
        position={[-1.34, 0.837, -1.849]}
      >
        {activeToolTip != "turntable" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("turntable")}
          >
            <DescriptionOpenerGreen position={[0, 0.25, 0]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("turntable")}
          >
            <DescriptionOpenerOrange position={[0, 0.25, 0]} />

            <Html
              center
              position={[0, 0.62, 0]}
              wrapperClass={activeToolTip === "turntable" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              Stand: Ikea Setskog <br />
              Turntable: Audio-Technica AT-LP60X <br />
              Speakers: Edifier R1280DBS <br />
              Favourite Artist: Kanye West <br />
              Favourite Album : Life of Pablo <br />
            </Html>
          </mesh>
        )}
      </mesh>

      <mesh
        geometry={nodes.vinyls.geometry}
        material={bakedTexture}
        position={[-1.32, 0.38, -1.76]}
      />
      {/* up | turntable  */}

      {/* down | apple homepod */}
      <mesh
        geometry={nodes.appleHomepod.geometry}
        material={bakedTexture}
        position={[-0.693, 0.449, -1.846]}
      >
        {activeToolTip != "homepod" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("homepod")}
          >
            <DescriptionOpenerGreen position={[-0.1, 0.15, 0]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("homepod")}
          >
            <DescriptionOpenerOrange position={[-0.1, 0.15, 0]} />

            <Html
              center
              position={[-0.1, 0.5, 0]}
              wrapperClass={activeToolTip === "homepod" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              APPLE TV 5K <br />
              APPLE HOMEPOD MINI <br />
              <br />
              Aaaaaple sheep, checking in!
              <br />
            </Html>
          </mesh>
        )}
      </mesh>
      <mesh
        geometry={nodes.appleTV.geometry}
        material={bakedTexture}
        position={[-0.864, 0.416, -1.856]}
      />

      {/* up | apple homepod */}

      {/* down | f1 lego */}
      <mesh
        geometry={nodes.legoF1.geometry}
        material={bakedTexture}
        position={[-0.038, 0.46, -1.817]}
        rotation={[0, -1.571, 0]}
      >
        {activeToolTip != "f1" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("f1")}
          >
            <DescriptionOpenerGreen position={[-0.1, 0.13, -0.1]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("f1")}
          >
            <DescriptionOpenerOrange position={[-0.1, 0.13, -0.1]} />

            <Html
              center
              position={[-0.1, 0.5, -0.1]}
              wrapperClass={activeToolTip === "f1" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              MC LAREN F1 LEGO - 1434 PIECES <br />
              <br />
              I'll be honest with you, it's been sitting unfinished for the past
              six months.
            </Html>
          </mesh>
        )}
      </mesh>

      <mesh
        castShadow
        receiveShadow
        geometry={nodes.legof1Tires.geometry}
        material={bakedTexture}
        position={[-0.122, 0.445, -1.742]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.045, 0.022, 0.045]}
      />
      {/* up | f1 lego */}

      {/* down | catan */}
      <mesh
        geometry={nodes.catan.geometry}
        material={bakedTexture}
        position={[1.028, 1.257, -1.688]}
      >
        {activeToolTip != "catan" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("catan")}
          >
            <DescriptionOpenerGreen position={[0, 0.27, 0]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("catan")}
          >
            <DescriptionOpenerOrange position={[0, 0.27, 0]} />

            <Html
              center
              position={[0, 0.65, 0]}
              wrapperClass={activeToolTip === "catan" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              SETTLERS OF CATAN <br />
              -first edition- <br />
              <br />
              Next to chess, it's my ultimate favorite game, no contest.
              <br />
              <br />
              Play with me on colonist.io: @ddrchf
            </Html>
          </mesh>
        )}
      </mesh>
      {/* up | catan */}

      <mesh geometry={nodes.paintingsPacea.geometry} material={bakedTexture} />

      <mesh
        geometry={nodes.ikeaTable.geometry}
        material={bakedTexture}
        position={[-0.224, 0.023, 0.408]}
        rotation={[0.132, -0.445, -0.121]}
      ></mesh>

      <mesh
        geometry={nodes.legoVan.geometry}
        material={bakedTexture}
        position={[-0.346, 0.071, -1.65]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.021}
      />
      <mesh
        geometry={nodes.boardgames.geometry}
        material={bakedTexture}
        position={[-0.211, 0.191, -1.733]}
        rotation={[0, Math.PI / 2, 0]}
      >
        {activeToolTip != "boardgames" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("boardgames")}
          >
            <DescriptionOpenerGreen position={[-0, 0.06, -0.22]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("boardgames")}
          >
            <DescriptionOpenerOrange position={[-0, 0.06, -0.22]} />

            <Html
              center
              position={[0, 0.5, -0.22]}
              wrapperClass={activeToolTip === "boardgames" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              VW T1 Camper Van Lego - 1334 pieces - I swear this is finished!{" "}
              <br />
              <br />
              BOARGAMES: <br />
              7 Wonders <br />
              Ticket to ride <br />
              Exploding kittens <br />
              You are waiting in line
            </Html>
          </mesh>
        )}
      </mesh>

      <mesh
        geometry={nodes.oziCat.geometry}
        material={bakedTexture}
        position={[-0.579, 0.174, -0.477]}
        rotation={[0, -0.557, 0]}
      >
        {activeToolTip != "ozi" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("ozi")}
          >
            <DescriptionOpenerGreen position={[0, 0.35, 0]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("ozi")}
          >
            <DescriptionOpenerOrange position={[0, 0.35, 0]} />

            <Html
              center
              position={[0, 0.55, -0.22]}
              wrapperClass={activeToolTip === "ozi" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              Introducing OZI, the cat whose meows are a relentless request for
              food
            </Html>
          </mesh>
        )}
      </mesh>

      <mesh
        geometry={nodes.floor.geometry}
        material={bakedTexture}
        position={[0, 0, 0.021]}
      />
      <mesh
        geometry={nodes.walls.geometry}
        material={bakedTexture}
        position={[-0.151, 1.503, -2.083]}
        scale={[1, 1, 1.022]}
      />
      <mesh
        geometry={nodes.enetriShelf001.geometry}
        material={bakedTexture}
        position={[-2.021, 1.75, -0.526]}
      />

      <mesh
        geometry={nodes.ikeaDoubleShelf008.geometry}
        material={bakedTexture}
        position={[1.19, 0.75, -1.801]}
      >
        {activeToolTip != "chessboard" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("chessboard")}
          >
            <DescriptionOpenerGreen position={[0, 1.4, -0.1]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("chessboard")}
          >
            <DescriptionOpenerOrange position={[0, 1.4, -0.1]} />

            <Html
              center
              position={[0, 1.8, -0.1]}
              wrapperClass={activeToolTip === "chessboard" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              CHESSBOARD signed by 10 of the best players in the world: <br />
              Ian Nepomniachtchi | Alireza Firouzja | Fabiano Caruana | Anish
              Giri | Ding Liren | Wesley So | Maxime Vachier-Lagrave |
              Jan-Krysztof Duda | Richard Rapport | Bogdan-Daniel Deac
            </Html>
          </mesh>
        )}
      </mesh>
      <mesh
        geometry={nodes.turntableSpeakers.geometry}
        material={bakedTexture}
        position={[0.257, 0.184, -1.606]}
      />

      <mesh
        geometry={nodes.ikeaSimpleShelf.geometry}
        material={bakedTexture}
        position={[-0.311, 0.2, -1.772]}
      />

      <mesh
        geometry={nodes.blueLamp.geometry}
        material={bakedTexture}
        position={[1.759, 1.08, 0.083]}
      />
      <mesh
        geometry={nodes.desk.geometry}
        material={bakedTexture}
        position={[1.794, 0.053, 0.129]}
      >
        {activeToolTip != "desk" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("desk")}
          >
            <DescriptionOpenerGreen position={[-0.2, 0.8, -0.95]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("desk")}
          >
            <DescriptionOpenerOrange position={[-0.2, 0.8, -0.95]} />
          </mesh>
        )}

        <Html
          center
          position={[-0.2, 1.25, -0.95]}
          wrapperClass={activeToolTip === "desk" ? "label" : "hidden"}
          distanceFactor={0.003}
        >
          DEVICES:
          <br />
          MacBookPro M3 max 16"
          <br />
          Apple Studio Display
          <br />
          Aaaaaple sheep, checking in again! <br />
          <br />
          FURNITURE: <br />
          Ikea ANFALLARE desk
          <br /> Eames Style Lobby Chair <br /> Poldina Pro Lamp
        </Html>
      </mesh>
      <mesh
        geometry={nodes.ikeaMonitorStand.geometry}
        material={bakedTexture}
        position={[1.692, 0.827, -0.502]}
      />
      <mesh
        geometry={nodes.smallPlant.geometry}
        material={bakedTexture}
        position={[1.706, 0.831, -1.02]}
      />
      <mesh
        geometry={nodes.carpet.geometry}
        material={bakedTexture}
        position={[-0.464, 0.004, -0.497]}
      />

      <mesh
        geometry={nodes.darts001.geometry}
        material={bakedTexture}
        position={[1.973, 1.836, 0.744]}
      >
        {activeToolTip != "painting" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("painting")}
          >
            <DescriptionOpenerGreen position={[0, 0.6, 0.85]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("painting")}
          >
            <DescriptionOpenerOrange position={[0, 0.6, 0.85]} />

            <Html
              center
              position={[0, 0.8, 0.85]}
              wrapperClass={activeToolTip === "painting" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              Paintings by CONSTANTIN PACEA - Famous Romanian Painter <br />
            </Html>
          </mesh>
        )}
      </mesh>

      <mesh
        geometry={nodes.sectionPlanes002.geometry}
        material={bakedTexture}
        position={[2.097, 1.448, 0.062]}
      />
      <mesh
        geometry={nodes.darts.geometry}
        material={bakedTexture}
        position={[1.973, 1.836, 0.744]}
      />

      <mesh
        castShadow
        receiveShadow
        geometry={nodes.ikeaVase.geometry}
        material={bakedTexture}
        position={[0.142, 0.605, 0.696]}
        rotation={[-Math.PI, 0.546, -Math.PI]}
      >
        {activeToolTip != "flowers" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("flowers")}
          >
            <DescriptionOpenerGreen position={[0.3, 0.05, -0.05]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("flowers")}
          >
            <DescriptionOpenerOrange position={[0.3, 0.05, -0.05]} />

            <Html
              center
              position={[0.3, 0.32, -0.05]}
              wrapperClass={activeToolTip === "flowers" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              IKEA LÖVBACKEN Table <br />
              IKEA CHILIFRUKT Vase <br />
              LEGO Flowers
            </Html>
          </mesh>
        )}
      </mesh>
      <mesh
        geometry={nodes.tableBooks.geometry}
        material={bakedTexture}
        position={[-0.062, 0.529, 0.634]}
        rotation={[-Math.PI, 0.016, -Math.PI]}
      />
      <mesh
        geometry={nodes.legoFlowers.geometry}
        material={bakedTexture}
        position={[0.15, 0.781, 0.661]}
        rotation={[2.679, 1.315, -2.894]}
      />
      <mesh
        geometry={nodes.monstera.geometry}
        material={bakedTexture}
        position={[1.587, 0.222, 1.673]}
      />
      <mesh
        geometry={nodes.coffeeShader.geometry}
        material={bakedTexture}
        position={[-1.771, 0.586, 1.355]}
      />

      <mesh
        geometry={nodes.emissivePaintingLamp.geometry}
        material={bakedTexture}
        position={[1.854, 2.636, -0.503]}
      />
      <mesh
        geometry={nodes.donutCable.geometry}
        material={bakedTexture}
        position={[-1.306, 0.712, -1.98]}
        rotation={[0, 0, -1.58]}
      />

      <mesh
        geometry={nodes.dartsArrows.geometry}
        material={bakedTexture}
        position={[1.781, 1.824, 0.806]}
        rotation={[-Math.PI / 2, -1.52, 0]}
      />
      <mesh
        geometry={nodes.turntableStand.geometry}
        material={bakedTexture}
        position={[-1.34, 0.147, -1.76]}
      >
        {activeToolTip != "donut" ? (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("donut")}
          >
            <DescriptionOpenerGreen position={[0.012, 2.1, -0.18]} />
          </mesh>
        ) : (
          <mesh
            onPointerOver={() => set(true)}
            onPointerOut={() => set(false)}
            onClick={() => handleActiveToolTip("donut")}
          >
            <DescriptionOpenerOrange position={[0.012, 2.1, -0.18]} />

            <Html
              center
              position={[0.012, 2.25, -0.18]}
              wrapperClass={activeToolTip === "donut" ? "label" : "hidden"}
              distanceFactor={0.003}
            >
              Favourite Lamp: IKEA VARMBLIXT
            </Html>
          </mesh>
        )}
      </mesh>
      <mesh
        geometry={nodes.plinta.geometry}
        material={bakedTexture}
        position={[1.989, 0.12, 2.14]}
      />

      <mesh
        geometry={nodes.blueLampLight.geometry}
        material={bakedTexture}
        position={[1.759, 1.117, 0.083]}
      />
      <mesh
        geometry={nodes.emissivePaintingLamp.geometry}
        material={bakedTexture}
        position={[1.854, 2.636, -0.503]}
      />

      <mesh
        geometry={nodes.lamp.geometry}
        material={bakedTexture}
        position={[1.953, 2.649, -0.503]}
      />
    </group>
  );
}

useGLTF.preload("/room-components.glb");
