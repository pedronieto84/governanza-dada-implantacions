import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { retry } from 'rxjs/operators';

import { API_BASE } from '../../../api.config';

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

  sistemas: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${API_BASE}/api/data/sistemas`).pipe(retry({ count: 5, delay: 2000 })).subscribe({
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
