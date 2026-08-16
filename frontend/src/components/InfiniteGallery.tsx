"use client"

const useIsStaticRenderer = () => false
import { useMotionValue } from "framer-motion"
import * as React from "react"
import { useEffect, useMemo, useRef } from "react"

type GalleryImage = { src: string; srcSet?: string; alt?: string }

interface InfiniteGalleryProps {
    width?: string | number
    height?: string | number
    className?: string
    images?: GalleryImage[]
    density?: number
    imageWidth?: number
    imageHeight?: number
    rounded?: number
    dragSpeed?: number
    driftAmount?: number
    friction?: number
    backgroundColor?: string
    style?: React.CSSProperties
}

const DEFAULT_IMAGES: GalleryImage[] = [
    { src: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80", alt: "Command Center Dashboard Overview" },
    { src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80", alt: "Incident Investigation Timeline" },
    { src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80", alt: "Interactive Attack Graph" },
    { src: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80", alt: "Forensic Evidence Coverage FEC Audit" },
    { src: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=900&q=80", alt: "AI Defensive Control Recommendations" },
    { src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80", alt: "Controlled Attack Replay Simulation" },
    { src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80", alt: "Healthcare Portal & Patient Records" },
]

const COMPONENT_DEFAULTS = {
    width: "100%",
    height: "100%",
    className: "",
    images: DEFAULT_IMAGES,
    density: 5,
    imageWidth: 150,
    imageHeight: 150,
    rounded: 3,
    dragSpeed: 20,
    driftAmount: 20,
    friction: 10,
    backgroundColor: "#000000",
}

function hash3(cx: number, cy: number, cz: number, salt: number) {
    let h = (cx | 0) * 0x8da6b343
    h ^= Math.imul(cy | 0, 0xd8163841)
    h ^= Math.imul(cz | 0, 0xcb1ab31f)
    h ^= salt | 0
    h ^= h >>> 16
    h = Math.imul(h, 0x7feb352d)
    h ^= h >>> 15
    h = Math.imul(h, 0x846ca68b)
    h ^= h >>> 16
    return h >>> 0
}

function mulberry32(seed: number) {
    let a = seed >>> 0
    return () => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t
}

type Tile = {
    wx: number
    wy: number
    cx: number
    cy: number
    slot: number
    octave: number
    imgIdx: number
    w: number
    h: number
    rot: number
    bakedScale: number
}

const PX_PER_UNIT = 6
const CELL_SIZE = 110
const MAX_RANGE = 20

export default function InfiniteGallery(props: InfiniteGalleryProps) {
    props = { ...COMPONENT_DEFAULTS, ...props }
    const {
        width,
        height,
        className,
        images,
        density,
        imageWidth,
        imageHeight,
        rounded,
        dragSpeed,
        driftAmount,
        friction,
        backgroundColor,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement | null>(null)
    const sceneRef = useRef<HTMLDivElement | null>(null)
    const isStatic = useIsStaticRenderer()

    const safeImages = Array.isArray(images) && images.length > 0 ? images : DEFAULT_IMAGES
    const safeDensity = Math.max(1, Math.min(15, Math.floor(density || 5)))
    const safeImageWidth = Math.max(8, Math.min(4000, imageWidth || 150))
    const safeImageHeight = Math.max(8, Math.min(4000, imageHeight || 150))
    const safeRounded = Math.max(0, Math.min(20, rounded ?? 3))
    const safeDragSpeed = Math.max(0.1, Math.min(5, (dragSpeed || 20) / 20))
    const safeDriftAmount = Math.max(0, Math.min(20, driftAmount ?? 8))
    const safeFriction = 1 - (Math.max(1, Math.min(20, friction ?? 10)) / 20) * 0.3

    const targetX = useMotionValue(0)
    const targetY = useMotionValue(0)
    const camX = useMotionValue(0)
    const camY = useMotionValue(0)
    const velX = useMotionValue(0)
    const velY = useMotionValue(0)

    const targetLogZoom = useMotionValue(0)
    const logZoom = useMotionValue(0)
    const velLogZoom = useMotionValue(0)

    const driftTX = useMotionValue(0)
    const driftTY = useMotionValue(0)
    const driftX = useMotionValue(0)
    const driftY = useMotionValue(0)

    const subN = Math.max(1, Math.ceil(Math.sqrt(safeDensity)))
    const subSize = CELL_SIZE / subN
    const SUBCELL_INNER_PAD = 0.1
    const effectivePerCell = Math.min(safeDensity, subN * subN)

    const imagesCount = safeImages.length

    const SCALE_MIN = 0.45
    const SCALE_MAX = 1.6

    const generateCell = useMemo(() => {
        return (gx: number, gy: number, octave: number): Tile[] => {
            const seed = hash3(gx, gy, octave | 0, 0x9e3779b1)
            const rand = mulberry32(seed)

            const totalSubs = subN * subN
            const subs = new Array<number>(totalSubs)
            for (let i = 0; i < totalSubs; i++) subs[i] = i
            for (let i = totalSubs - 1; i > 0; i--) {
                const j = Math.floor(rand() * (i + 1))
                const tmp = subs[i]
                subs[i] = subs[j]
                subs[j] = tmp
            }

            const tiles: Tile[] = []
            const count = Math.min(effectivePerCell, totalSubs)

            const pad = subSize * SUBCELL_INNER_PAD
            const innerRange = Math.max(0, subSize - pad * 2)

            const cellX0 = gx * CELL_SIZE
            const cellY0 = gy * CELL_SIZE

            const wWorld = safeImageWidth / PX_PER_UNIT
            const hWorld = safeImageHeight / PX_PER_UNIT

            for (let slot = 0; slot < count; slot++) {
                const subIdx = subs[slot]
                const sx = subIdx % subN
                const sy = Math.floor(subIdx / subN)

                const wx = cellX0 + sx * subSize + pad + rand() * innerRange
                const wy = cellY0 + sy * subSize + pad + rand() * innerRange

                const bakedScale = SCALE_MIN + rand() * (SCALE_MAX - SCALE_MIN)

                const imgIdx = imagesCount > 0 ? Math.floor(rand() * imagesCount) % imagesCount : 0

                tiles.push({
                    wx,
                    wy,
                    cx: gx,
                    cy: gy,
                    slot,
                    octave,
                    imgIdx,
                    w: wWorld,
                    h: hWorld,
                    rot: 0,
                    bakedScale,
                })
            }

            return tiles
        }
    }, [
        safeImages,
        imagesCount,
        safeImageWidth,
        safeImageHeight,
        subN,
        subSize,
        effectivePerCell,
    ])

    useEffect(() => {
        const scene = sceneRef.current
        const container = containerRef.current
        if (!scene) return

        let cW = container ? container.clientWidth || 900 : 900
        let cH = container ? container.clientHeight || 600 : 600
        const ro = new ResizeObserver(() => {
            if (container) {
                cW = container.clientWidth || cW
                cH = container.clientHeight || cH
            }
        })
        if (container) ro.observe(container)

        const layerPools = new Map<
            number,
            {
                tileEls: Map<string, HTMLDivElement>
                imgEls: Map<string, HTMLImageElement>
            }
        >()

        const getPool = (octave: number) => {
            let pool = layerPools.get(octave)
            if (!pool) {
                pool = { tileEls: new Map(), imgEls: new Map() }
                layerPools.set(octave, pool)
            }
            return pool
        }

        const disposeLayer = (octave: number) => {
            const pool = layerPools.get(octave)
            if (!pool) return
            pool.tileEls.forEach((el) => {
                if (el.parentNode === scene) scene.removeChild(el)
            })
            pool.tileEls.clear()
            pool.imgEls.clear()
            layerPools.delete(octave)
        }

        const disposeAllLayers = () => {
            Array.from(layerPools.keys()).forEach(disposeLayer)
        }

        const removeTile = (octave: number, key: string) => {
            const pool = layerPools.get(octave)
            if (!pool) return
            const el = pool.tileEls.get(key)
            if (el && el.parentNode === scene) scene.removeChild(el)
            pool.tileEls.delete(key)
            pool.imgEls.delete(key)
        }

        const ensureTile = (t: Tile): HTMLDivElement => {
            const pool = getPool(t.octave)
            const key = `${t.cx},${t.cy},${t.slot}`
            let el = pool.tileEls.get(key)
            if (!el) {
                el = document.createElement("div")
                el.style.position = "absolute"
                el.style.left = "50%"
                el.style.top = "50%"
                el.style.transformOrigin = "0 0"
                el.style.willChange = "transform, opacity"
                el.style.pointerEvents = "none"
                el.dataset.tileKey = key

                const img = document.createElement("img")
                const src = safeImages[t.imgIdx]
                img.src = src?.src || ""
                if (src?.srcSet) img.srcset = src.srcSet
                img.alt = src?.alt || ""
                img.draggable = false
                img.style.width = "100%"
                img.style.height = "100%"
                img.style.objectFit = "cover"
                img.style.display = "block"
                img.style.pointerEvents = "none"
                img.style.userSelect = "none"
                el.appendChild(img)

                scene.appendChild(el)
                pool.tileEls.set(key, el)
                pool.imgEls.set(key, img)
            }
            return el
        }

        const projectLayer = (
            octave: number,
            layerScale: number,
            layerAlpha: number,
            layerZBase: number,
            cx: number,
            cy: number
        ) => {
            const pool = getPool(octave)

            const camCellX = Math.floor(cx / CELL_SIZE)
            const camCellY = Math.floor(cy / CELL_SIZE)

            const worldHalfX = cW / 2 / (PX_PER_UNIT * layerScale)
            const worldHalfY = cH / 2 / (PX_PER_UNIT * layerScale)
            const rangeX = Math.min(MAX_RANGE, Math.ceil(worldHalfX / CELL_SIZE) + 1)
            const rangeY = Math.min(MAX_RANGE, Math.ceil(worldHalfY / CELL_SIZE) + 1)

            const visibleKeys = new Set<string>()
            const tilesThisFrame: Tile[] = []

            for (let dy = -rangeY; dy <= rangeY; dy++) {
                for (let dx = -rangeX; dx <= rangeX; dx++) {
                    const tiles = generateCell(camCellX + dx, camCellY + dy, octave)
                    for (let i = 0; i < tiles.length; i++) {
                        tilesThisFrame.push(tiles[i])
                    }
                }
            }

            const orderKeys: string[] = new Array(tilesThisFrame.length)
            const orderScale: number[] = new Array(tilesThisFrame.length)

            for (let i = 0; i < tilesThisFrame.length; i++) {
                const t = tilesThisFrame[i]
                const key = `${t.cx},${t.cy},${t.slot}`
                visibleKeys.add(key)

                const dxPx = (t.wx - cx) * layerScale * PX_PER_UNIT
                const dyPx = (t.wy - cy) * layerScale * PX_PER_UNIT
                const s = t.bakedScale * layerScale

                const el = ensureTile(t)
                const img = pool.imgEls.get(key)

                const wPx = t.w * PX_PER_UNIT
                const hPx = t.h * PX_PER_UNIT

                el.style.transform = `translate3d(${dxPx}px, ${dyPx}px, 0) scale(${s}) rotate(${t.rot}deg) translate(${-wPx / 2}px, ${-hPx / 2}px)`
                el.style.width = `${wPx}px`
                el.style.height = `${hPx}px`
                el.style.opacity = String(layerAlpha)

                if (img) {
                    const radiusPx = (safeRounded / 20) * (Math.min(wPx, hPx) / 2)
                    img.style.borderRadius = `${radiusPx}px`
                }

                orderKeys[i] = key
                orderScale[i] = t.bakedScale
            }

            for (const key of Array.from(pool.tileEls.keys())) {
                if (!visibleKeys.has(key)) removeTile(octave, key)
            }

            const idxs = orderKeys.map((_, i) => i)
            idxs.sort((a, b) => orderScale[a] - orderScale[b])
            for (let k = 0; k < idxs.length; k++) {
                const el = pool.tileEls.get(orderKeys[idxs[k]])
                if (el) el.style.zIndex = String(layerZBase + k)
            }
        }

        let lastOctaves: Set<number> = new Set()

        const project = () => {
            const cx = camX.get()
            const cy = camY.get()
            const lz = logZoom.get()

            const octave = Math.floor(lz)
            const frac = lz - octave

            const scaleCurrent = Math.pow(2, frac)
            const scaleNext = Math.pow(2, frac - 1)

            const alphaCurrent = 1 - frac
            const alphaNext = frac

            const zBaseCurrent = 0
            const zBaseNext = 100000

            projectLayer(octave, scaleCurrent, alphaCurrent, zBaseCurrent, cx, cy)
            projectLayer(octave + 1, scaleNext, alphaNext, zBaseNext, cx, cy)

            const nowOctaves = new Set<number>([octave, octave + 1])
            for (const o of Array.from(lastOctaves)) {
                if (!nowOctaves.has(o)) disposeLayer(o)
            }
            for (const o of Array.from(layerPools.keys())) {
                if (!nowOctaves.has(o)) disposeLayer(o)
            }
            lastOctaves = nowOctaves
        }

        project()
        if (isStatic) {
            ro.disconnect()
            return
        }

        let raf = 0

        const loop = () => {
            const tx = targetX.get() + velX.get()
            const ty = targetY.get() + velY.get()
            targetX.set(tx)
            targetY.set(ty)
            velX.set(velX.get() * safeFriction)
            velY.set(velY.get() * safeFriction)

            // Auto-zoom continuously to create an infinite flying-through effect
            velLogZoom.set(0.015) // small continuous forward speed
            const vlz = velLogZoom.get()
            if (vlz !== 0) {
                targetLogZoom.set(targetLogZoom.get() + vlz)
                velLogZoom.set(vlz * safeFriction)
            }

            driftX.set(lerp(driftX.get(), driftTX.get() * safeDriftAmount, 0.08))
            driftY.set(lerp(driftY.get(), driftTY.get() * safeDriftAmount, 0.08))

            camX.set(lerp(camX.get(), targetX.get() + driftX.get(), 0.18))
            camY.set(lerp(camY.get(), targetY.get() + driftY.get(), 0.18))
            logZoom.set(lerp(logZoom.get(), targetLogZoom.get(), 0.18))

            project()
            raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
            disposeAllLayers()
        }
    }, [
        generateCell,
        safeFriction,
        safeDriftAmount,
        safeRounded,
        safeImages,
        isStatic,
        camX,
        camY,
        logZoom,
        targetX,
        targetY,
        targetLogZoom,
        velX,
        velY,
        velLogZoom,
        driftX,
        driftY,
        driftTX,
        driftTY,
    ])

    useEffect(() => {
        const el = containerRef.current
        if (!el || isStatic) return

        const onWheel = (e: WheelEvent) => {
            e.preventDefault()
        }

        el.addEventListener("wheel", onWheel, { passive: false })

        return () => {
            el.removeEventListener("wheel", onWheel)
        }
    }, [isStatic])

    const resolveDim = (v: string | number | undefined, fallback: string): string => {
        if (v == null) return fallback
        if (typeof v === "number") return `${v}px`
        return v
    }

    const wrapperStyle: React.CSSProperties = {
        position: "relative",
        width: resolveDim(width, "100%"),
        height: resolveDim(height, "100%"),
        minWidth: 600,
        minHeight: 600,
        overflow: "hidden",
        backgroundColor,
        touchAction: "none",
        userSelect: "none",
        ...style,
    }

    const sceneStyle: React.CSSProperties = {
        position: "absolute",
        inset: 0,
    }

    return (
        <div ref={containerRef} className={className} style={wrapperStyle}>
            <div ref={sceneRef} style={sceneStyle} />
        </div>
    )
}
