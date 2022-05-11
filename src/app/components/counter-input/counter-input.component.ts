import { Component, OnInit } from "@angular/core";

@Component({
  selector: "counter-input",
  templateUrl: "./counter-input.component.html",
  styleUrls: ["./counter-input.component.scss"],
})
export class CounterInputComponent implements OnInit {
  count: number = 0;
  constructor() {}

  ngOnInit() {}
}
