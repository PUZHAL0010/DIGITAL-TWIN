import { StructuralComponent } from '../types/bridge';
import { CollapseSimulationState } from '../types/failure';
import { ShipVesselState } from '../types/simulation';
import { stepScenarioFailurePhysics, ScenarioPhysicsOutput } from './scenarioFailureEngine';

export function stepProgressiveFailurePhysics(
  components: Record<string, StructuralComponent>,
  state: CollapseSimulationState,
  deltaSeconds: number,
  ship: ShipVesselState
): ScenarioPhysicsOutput {
  return stepScenarioFailurePhysics(components, state, deltaSeconds, ship);
}
