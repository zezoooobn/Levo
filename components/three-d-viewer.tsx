"use client"

import { useEffect, useRef } from "react"

export function ThreeDViewer({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let mounted = true
    let renderer: any
    let scene: any
    let camera: any
    let controls: any
    let frameId: number | null = null

    ;(async () => {
      const THREE = await import("three")
      const { WebGLRenderer, Scene, PerspectiveCamera, AmbientLight, DirectionalLight, Color, sRGBEncoding } = THREE
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js")

      const ext = src.split(".").pop()?.toLowerCase() || ""
      let loader: any = null
      if (ext === "gltf" || ext === "glb") {
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js")
        loader = new GLTFLoader()
      } else if (ext === "obj") {
        const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js")
        loader = new OBJLoader()
      } else if (ext === "stl") {
        const { STLLoader } = await import("three/examples/jsm/loaders/STLLoader.js")
        loader = new STLLoader()
      } else if (ext === "fbx") {
        const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js")
        loader = new FBXLoader()
      }

      if (!containerRef.current || !mounted) return
      const container = containerRef.current

      renderer = new WebGLRenderer({ antialias: true })
      renderer.outputEncoding = sRGBEncoding
      renderer.setClearColor(new Color(0xffffff))
      renderer.setSize(container.clientWidth, container.clientHeight)
      container.appendChild(renderer.domElement)

      scene = new Scene()
      camera = new PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000)
      camera.position.set(0, 1, 3)

      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true

      const amb = new AmbientLight(0xffffff, 0.6)
      scene.add(amb)
      const dir = new DirectionalLight(0xffffff, 0.8)
      dir.position.set(3, 5, 2)
      scene.add(dir)

      if (loader) {
        loader.load(
          src,
          (g: any) => {
            const obj = g.scene || g
            scene.add(obj)
          },
          undefined,
          () => {}
        )
      }

      const onResize = () => {
        if (!containerRef.current) return
        const w = containerRef.current.clientWidth
        const h = containerRef.current.clientHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      window.addEventListener("resize", onResize)

      const loop = () => {
        controls.update()
        renderer.render(scene, camera)
        frameId = requestAnimationFrame(loop)
      }
      loop()
    })()

    return () => {
      mounted = false
      if (frameId) cancelAnimationFrame(frameId)
      try {
        if (renderer) {
          renderer.dispose()
          const el = renderer.domElement
          if (el && el.parentNode) el.parentNode.removeChild(el)
        }
      } catch {}
    }
  }, [src])

  return <div ref={containerRef} style={{ width: "100%", height: 400 }} />
}