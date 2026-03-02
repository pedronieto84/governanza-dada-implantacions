import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

const API_BASE = 'http://localhost:3005';

const EMPTY_SISTEMA = () => ({
  nomCurt: '', extern: 'No', descripcio: '', tipus: '', proveidor: '',
  adminSis: '', adminEmail: '', adminUnitat: '',
  arqDada: '', arqEmail: '', arqUnitat: ''
});

@Component({
  selector: 'app-sistemas',
  templateUrl: './sistemas.html',
  styleUrl: './sistemas.css',
  standalone: true,
  imports: [FormsModule]
})
export class Sistemas implements OnInit {
  isModalOpen = false;
  editIndex = -1;
  currentItem: any = EMPTY_SISTEMA();

  sistemas = [
    {
      nomCurt: 'Servidor POSSE',
      extern: 'No',
      descripcio: '',
      tipus: 'Servidor amb un programa que es diu SIGEP instal·lat al servidor',
      proveidor: 'AITOS és l\'empresa que va instal·lar i manté el programa...',
      adminSis: 'Departament d\'Informàtica',
      adminEmail: 'obrermpm@premiadedalt.cat',
      adminUnitat: 'Polítiques Digitals',
      arqDada: 'AITOS',
      arqEmail: 'AITOS',
      arqUnitat: 'AITOS'
    },
    {
      nomCurt: 'Gestor d\'expedients',
      extern: 'Sí',
      descripcio: 'Gestor d\'expedients',
      tipus: 'Gestor d\'expedients',
      proveidor: 'Audifilm',
      adminSis: 'Secretaria i Polítiques Digitals',
      adminEmail: '',
      adminUnitat: '',
      arqDada: 'Audifilm',
      arqEmail: 'Audifilm',
      arqUnitat: 'Audifilm'
    },
    {
      nomCurt: 'Comptabilitat Diputació',
      extern: 'Sí',
      descripcio: 'Comptabilitat',
      tipus: 'Comptabilitat',
      proveidor: 'Diputació Barcelona (Berger Levraux)',
      adminSis: 'Polítiques Digitals / Intervenció',
      adminEmail: 'Intervenció dona permisos',
      adminUnitat: '',
      arqDada: 'Informàtica / Intervenció',
      arqEmail: '',
      arqUnitat: ''
    },
    {
      nomCurt: 'Factures',
      extern: 'Sí',
      descripcio: 'Factures',
      tipus: 'Factures',
      proveidor: 'Diputació Barcelona (Berger Levraux)',
      adminSis: 'Polítiques Digitals / Intervenció',
      adminEmail: 'Intervenció dona permisos',
      adminUnitat: '',
      arqDada: 'Informàtica / Intervenció',
      arqEmail: '',
      arqUnitat: ''
    },
    {
      nomCurt: 'Tràmits',
      extern: 'Sí',
      descripcio: 'Portal de tràmits',
      tipus: 'Portal de tràmits',
      proveidor: 'Diputació Barcelona',
      adminSis: 'Polítiques Digitals / OAC',
      adminEmail: 'OAC',
      adminUnitat: '',
      arqDada: 'Informàtica / Intervenció',
      arqEmail: '',
      arqUnitat: ''
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${API_BASE}/api/data/sistemas`).subscribe({
      next: (data) => {
        if (data.sistemas) this.sistemas = data.sistemas;
      },
      error: () => console.warn('No saved Sistemas data found, using defaults.')
    });
  }

  saveData() {
    this.http.post(`${API_BASE}/api/data/sistemas`, { sistemas: this.sistemas }).subscribe({
      error: (err) => console.error('Error saving Sistemas data', err)
    });
  }

  openModal(index: number) {
    this.editIndex = index;
    this.currentItem = index === -1 ? EMPTY_SISTEMA() : { ...this.sistemas[index] };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveItem() {
    if (this.editIndex === -1) {
      this.sistemas.push({ ...this.currentItem });
    } else {
      this.sistemas[this.editIndex] = { ...this.currentItem };
    }
    this.isModalOpen = false;
    this.saveData();
  }

  deleteItem(index: number) {
    this.sistemas.splice(index, 1);
    this.saveData();
  }
}
