import { exercisesOf } from '@rythmes/content'
import { useState } from 'react'
import { Exercices } from '../components/Exercices'
import { calibrationFaite } from '../progression'
import { Calibration } from './Calibration'

/**
 * Le module 0 : calibrer, puis mesurer un point de départ.
 *
 * L'ordre n'est pas négociable. Diagnostiquer avant de calibrer reviendrait à
 * confondre le retard de la carte son avec un défaut de la musicienne — et à
 * commencer le cours sur un reproche injustifié.
 */
export function PriseDeReperes() {
  const [etape, setEtape] = useState<'calibrer' | 'diagnostiquer'>(
    calibrationFaite() ? 'diagnostiquer' : 'calibrer',
  )

  return (
    <div className="prise-de-reperes">
      <nav className="etapes">
        <button
          type="button"
          className={etape === 'calibrer' ? 'actif' : ''}
          onClick={() => setEtape('calibrer')}
        >
          1. Calibrer
        </button>
        <button
          type="button"
          className={etape === 'diagnostiquer' ? 'actif' : ''}
          onClick={() => setEtape('diagnostiquer')}
          disabled={!calibrationFaite()}
        >
          2. Où tu en es
        </button>
      </nav>

      {etape === 'calibrer' ? (
        <Calibration onFini={() => setEtape('diagnostiquer')} />
      ) : (
        <>
          <p className="aide">
            Quatre épreuves. Elles ne notent rien et ne ferment aucune porte :
            elles disent par où commencer. Si la dernière ne te dit rien, c’est
            exactement ce que le cours va construire.
          </p>
          <Exercices exercises={exercisesOf(0)} />
        </>
      )}
    </div>
  )
}
