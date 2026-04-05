import React from 'react'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

const QuantumFieldFX = ({ bloomIntensity = 0.35, chromaOffset = 0.0002 }) => {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.3}
        intensity={bloomIntensity}
        mipmapBlur
        blendFunction={BlendFunction.ADD}
      />
      <ChromaticAberration
        offset={[chromaOffset, chromaOffset]}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}

export default QuantumFieldFX
