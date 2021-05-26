import { snakelize } from '../../../../lib/utils/str'

import { getEnv } from '../../../../lib/env'
import Files from '../../../../lib/utils/files'

import { getPathToScreenshot } from '../../../../lib/queries/screenshot'


import { purge, upload } from '../upload'
import DefaultClient from '../../../../lib/models/common/http/DefaultClient'
import FakeClient, { FakeResponse } from '../../../../lib/models/common/http/FakeClient'
import { Variation, AsObject } from '../../../../lib/models/common/Variation'
import Slice from '../../../../lib/models/common/Slice'
import { CustomPaths } from '../../../../lib/models/paths'

const onError = (r: Response | FakeResponse, message = 'An error occured while pushing slice to Prismic') => ({
  err: r || new Error(message),
  status: r && r.status ? r.status : 500,
  reason: message,
})

const createOrUpdate = async ({
  slices,
  sliceName,
  model,
  client
}: {
  slices: ReadonlyArray<Slice<AsObject>>,
  sliceName: string,
  model: Slice<AsObject>,
  client: DefaultClient | FakeClient

}) => {
  if (slices.find(e => e.id === snakelize(sliceName))) {
    return await client.updateSlice(model)
  } else {
    return await client.insertSlice(model)
  }
}

const getSlices = async(client: DefaultClient | FakeClient) => {
  try {
    const res = await client.getSlice()
    if (res.status !== 200) {
      return { err: res, slices: [] }
    }
    const slices = await res.json()
    return { err: null, slices }
  } catch(e) {
    return { slices: [], err: e }
  }
}

export default async function handler(query: { sliceName: string, from: string }) {
  const { sliceName, from } = query
  const { env } = await getEnv()
  const { slices, err } = await getSlices(env.client)
  if (err) {
    console.error('[push] An error occured while fetching slices.\nCheck that you\'re properly logged in and that you have access to the repo.')
    return onError(err, `Error ${err.status}: Could not fetch remote slices`)
  }
  const modelPath = CustomPaths(env.cwd)
    .library(from)
    .slice(sliceName)
    .model()

  try {
      const jsonModel = Files.readJson(modelPath)
      const { err } = await purge(env, slices, sliceName, onError)
      if(err) return err
      
      const variationIds = jsonModel.variations.map((v: Variation<AsObject>) => v.id)
      
      let imageUrlsByVariation: { [variationId: string]: string } = {}

      for(let i = 0; i < variationIds.length; i += 1) {
        const variationId = variationIds[i]
        const screenshot = getPathToScreenshot({ cwd: env.cwd, from, sliceName, variationId })
        
        if(screenshot) {
          const { err, s3ImageUrl } = await upload(env, sliceName, variationId, screenshot.path, onError)
          if(err) throw new Error(err.reason)
          imageUrlsByVariation[variationId] = s3ImageUrl
        } else {
          throw new Error(`Unable to find a screenshot for slice ${sliceName} | variation ${variationId}`)
        }
      }
  
      console.log('[push]: pushing slice model to Prismic')

      const variations = jsonModel.variations.map((v: Variation<AsObject>) => ({ ...v, imageUrl: imageUrlsByVariation[v.id] }))

      const res = await createOrUpdate({
        slices,
        sliceName,
        model: {
          ...jsonModel,
          variations,
        },
        client: env.client
      })
      if (res.status > 209) {
        const message = res.text ? await res.text() : res.status.toString()
        console.error(`[push] Slice ${sliceName}: Unexpected error returned. Server message: ${message}`)
        throw new Error(message)
      }
      console.log('[push] done!')
      return {}
    } catch(e) {
      console.log(e)
      return onError(e, 'An unexpected error occured while pushing slice')
    }
}