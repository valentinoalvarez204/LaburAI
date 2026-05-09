import { AnalisisCVDto } from '../dto/analisis-cv.dto';

export interface IAPIService {
  analizarCV(textoCV: string): Promise<AnalisisCVDto>;
  calcularMatch(perfilCV: string, ofertaTrabajo: string): Promise<number>;
}
