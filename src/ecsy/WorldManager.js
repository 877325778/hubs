import {
  ThreeWorld,
  SceneEntity,
  BoneEntity,
  GroupEntity,
  Object3DEntity,
  SkinnedMeshEntity,
  MeshEntity,
  LineSegmentsEntity,
  LineEntity,
  LineLoopEntity,
  PointsEntity,
  PerspectiveCameraEntity,
  OrthographicCameraEntity,
  AmbientLightEntity,
  DirectionalLightEntity,
  HemisphereLightEntity,
  PointLightEntity,
  SpotLightEntity
} from "ecsy-three";

import { Rotating } from "./components/Rotating";
import { Animation } from "./components/Animation";
import { GLTFLoader } from "./components/GLTFLoader";
import { Image } from "./components/Image";
import { Loading } from "./components/Loading";
import { LoadingCube } from "./components/LoadingCube";
import { MediaLoader } from "./components/MediaLoader";
import { Held } from "./components/Held";
import { Holdable } from "./components/Holdable";
import { Hoverable } from "./components/Hoverable";
import { Hovered } from "./components/Hovered";
import { InteractionState } from "./components/InteractionState";
import { Interactor } from "./components/Interactor";
import { ConstrainOnHeld } from "./components/ConstrainOnHeld";
import { PhysicsBody } from "./components/PhysicsBody";
import { PhysicsShape } from "./components/PhysicsShape";
import { AFrameEntity } from "./components/AFrameEntity";
import { GLTFModel } from "./components/GLTFModel";
import { SpawnPoint } from "./components/SpawnPoint";
import { PhysicsConstraint } from "./components/PhysicsConstraint";
import { Networked } from "./components/Networked";
import { NetworkingState } from "./components/NetworkingState";
import { SceneRootTag } from "./components/SceneRootTag";

import { RotationSystem } from "./systems/RotationSystem";
import { InteractionSystem } from "./systems/InteractionSystem";
import { PhysicsSystem } from "./systems/PhysicsSystem";
import { ConstrainOnHeldSystem } from "./systems/ConstrainOnHeldSystem";
import { NetworkingSendSystem, NetworkingReceiveSystem } from "./systems/NetworkingSystem";

import { BoxTemplate } from "./templates/BoxTemplate";

export class WorldManager {
  constructor(aframeScene) {
    this.aframeScene = aframeScene;
    this.world = new ThreeWorld();
    this.initialized = false;
  }

  init() {
    this.world
      .registerEntityType(SceneEntity)
      .registerEntityType(BoneEntity)
      .registerEntityType(GroupEntity)
      .registerEntityType(Object3DEntity)
      .registerEntityType(SkinnedMeshEntity)
      .registerEntityType(MeshEntity)
      .registerEntityType(LineSegmentsEntity)
      .registerEntityType(LineEntity)
      .registerEntityType(LineLoopEntity)
      .registerEntityType(PointsEntity)
      .registerEntityType(PerspectiveCameraEntity)
      .registerEntityType(OrthographicCameraEntity)
      .registerEntityType(AmbientLightEntity)
      .registerEntityType(DirectionalLightEntity)
      .registerEntityType(HemisphereLightEntity)
      .registerEntityType(PointLightEntity)
      .registerEntityType(SpotLightEntity)
      .registerComponent(AFrameEntity)
      .registerComponent(Animation)
      .registerComponent(GLTFLoader)
      .registerComponent(GLTFModel)
      .registerComponent(Image)
      .registerComponent(Interactor)
      .registerComponent(Loading)
      .registerComponent(LoadingCube)
      .registerComponent(MediaLoader)
      .registerComponent(Held)
      .registerComponent(Holdable)
      .registerComponent(Hoverable)
      .registerComponent(Hovered)
      .registerComponent(InteractionState)
      .registerComponent(ConstrainOnHeld)
      .registerComponent(PhysicsConstraint)
      .registerComponent(PhysicsBody)
      .registerComponent(PhysicsShape)
      .registerComponent(Rotating)
      .registerComponent(SpawnPoint)
      .registerComponent(Networked)
      .registerComponent(SceneRootTag);

    this.world
      .registerSystem(NetworkingReceiveSystem)
      .registerSystem(InteractionSystem)
      //.registerSystem(LogInteractionStateSystem)
      .registerSystem(ConstrainOnHeldSystem)
      // .registerSystem(MediaLoaderSystem)
      // .registerSystem(ImageSystem)
      // .registerSystem(LoadingCubeSystem)
      // .registerSystem(GLTFLoaderSystem)
      // .registerSystem(AnimationSystem)
      .registerSystem(RotationSystem)
      .registerSystem(PhysicsSystem, { hubsSystem: this.aframeScene.systems["hubs-systems"].physicsSystem })
      .registerSystem(NetworkingSendSystem);

    this.scene = new SceneEntity(this.world) //.addComponent(ActionFrame, { value: this.aframeScene.systems["userinput"].frame });
      .addComponent(InteractionState)
      .addComponent(NetworkingState)
      .addComponent(SceneRootTag);

    this.aframeScene.object3D.add(this.scene);
    this.world.addEntity(this.scene);

    const networkingState = this.scene.getComponent(NetworkingState);

    const leftCursorEl = document.getElementById("left-cursor");

    this.leftCursor = this.world
      .createEntity()
      .addComponent(AFrameEntity, { value: leftCursorEl })
      .addComponent(Interactor, { id: "leftRemote" })
      .addComponent(PhysicsBody, { uuid: leftCursorEl.components["body-helper"].uuid, needsUpdate: false });

    this.rightCursorEl = document.getElementById("right-cursor");

    this.rightCursor = this.world
      .createEntity()
      .addComponent(AFrameEntity, { value: this.rightCursorEl })
      .addComponent(Interactor, { id: "rightRemote" })
      .addComponent(PhysicsBody, { uuid: this.rightCursorEl.components["body-helper"].uuid, needsUpdate: false });

    const leftControllerEl = document.getElementById("player-left-controller");

    this.leftHandController = this.world
      .createEntity()
      .addComponent(AFrameEntity, { value: leftControllerEl })
      .addComponent(Interactor, { id: "leftHand" })
      .addComponent(PhysicsBody, { uuid: leftControllerEl.components["body-helper"].uuid, needsUpdate: false });

    const rightControllerEl = document.getElementById("player-right-controller");

    this.rightHandController = this.world
      .createEntity()
      .addComponent(AFrameEntity, { value: rightControllerEl })
      .addComponent(Interactor, { id: "rightHand" })
      .addComponent(PhysicsBody, { uuid: rightControllerEl.components["body-helper"].uuid, needsUpdate: false });

    networkingState.registerTemplate(BoxTemplate);

    window.addEventListener("keyup", e => {
      if (e.key === "j") {
        const networkedBox = networkingState.createEntity(this.world, BoxTemplate);
        this.scene.add(networkedBox);
      }
    });

    this.initialized = true;
  }

  execute(dt, time) {
    // Call init after DOMContentLoaded has been fired, hubs-systems are initialized, and the physics-system is ready.
    if (!this.initialized && this.aframeScene.systems["hubs-systems"].physicsSystem.ready) {
      this.init();
    }

    this.world.execute(dt / 1000, time);
  }
}
