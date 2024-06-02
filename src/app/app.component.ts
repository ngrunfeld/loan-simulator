import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, JsonPipe } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JsonPipe, ReactiveFormsModule, CurrencyPipe, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  constructor(private formBuilder: FormBuilder) {}

  public cuotas: Array<any> = [];
  public tea = 0;
  public teaper = 0;
  
  public simulador = this.formBuilder.group({
    ammount: [10000, Validators.required],
    interest: [1.0, Validators.required],
    firstPayment: [0, Validators.required],
    montlyPayment: [500, Validators.required]
  });
  get f() { return this.simulador.controls; }

  ngOnInit() {
    this.recalculate(); 
  }

  recalculate() {
    this.cuotas = [];
    const preMonths = Number(this.simulador.get('firstPayment')?.value);
    const interest = Number(this.simulador.get('interest')?.value);
    const montlyPayment = Number(this.simulador.get('montlyPayment')?.value);
    const amount = Number(this.simulador.get('ammount')?.value)

    let saldo = amount;
    let accrued = 0;
    let payment = 0;
    let tasa = 0;


    while (saldo > 0) {
      tasa = (saldo / 100 * interest);
      saldo = saldo + tasa;

      if (this.cuotas.length < preMonths) payment = 0
      else payment = montlyPayment;

      if (saldo < montlyPayment) payment = saldo
      if (payment) saldo = saldo - payment

      accrued = accrued + payment;


      this.cuotas.push({
        saldo: saldo,
        accrued: accrued,
        tasa: tasa
      });
    }
    this.tea = accrued - amount;
    this.teaper = this.tea / amount;
  }

  exportXLS(): void {
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(document.getElementById('schema'));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'schema.xls');
  }
}
