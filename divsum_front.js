var c_fps_drawer = function() {
    this.tick_history = [];
};

c_fps_drawer.prototype = {
    draw: function(canvas) {
        var date = new Date();
        var tick = date.getTime();
        this.tick_history.push(tick);
        if(this.tick_history.length > 60) {
            this.tick_history.shift();
        }
        if(this.tick_history.length <= 1) {
            return
        }
        var dt = tick - this.tick_history[0];
        var fps = Math.round(1000.0 / dt * (this.tick_history.length - 1));

        canvas.drawText({
            fillStyle: "#FFF",
            x: canvas_width - 100,
            y: canvas_height - 12,
            fontSize: 10,
            text: "FPS:" + fps.toString() + " mouse:" + mouse_l.toString() + " " + mouse_r.toString(),
            //text: "FPS:" + fps.toString() + "mouse:"+ mouse_button.toString(),
            fromCenter: false
        });
    }
};

var c_field = function()
{
    this.card_field = [];
    this.width = 4;
    this.height = 4
    this.target_x = -1;
    this.target_y = -1;
    this.mouse_cell_x = 0;
    this.mouse_cell_y = 0;

    this.grid_h = 128;
    this.grid_w = 128;
    this.field_draw_offset_x = 20;
    this.field_draw_offset_y = 20;
    this.cards = [];
    for (var x = 0 ; x < this.width ; x++){
        var l = [];
        for (var y = 0 ; y < this.height ; y++){
            l.push(null);
        }
        this.card_field.push(l);
    }
};

c_field.prototype = {
    init: function(){

        var hash = location.hash.replace("#", "");
        console.log(hash);
        items = hash.split("_");
        if(hash!="" && items.length >=3) {
            for(var i=0; i < items.length; i+=3) {
                var card = new c_card();
                card.px = parseInt(items[i+0]);
                card.py = parseInt(items[i+1]);
                card.number = parseInt(items[i+2]);
                console.log(card);
                this.cards.push(card);
            }
        }
        else{
            var c1 = new c_card();
            c1.px = 0;
            c1.py = 0;
            c1.number = 100;
            console.log(c1);
            this.cards.push(c1);
        }
    },
    update_card_field_map: function() {
        for (var x = 0 ; x < this.width ; x++){
            for (var y = 0 ; y < this.height ; y++){
                this.card_field[x][y] = null;
            }
        }

        for(var i in this.cards){
            var cx = this.cards[i].px;
            var cy = this.cards[i].py;
            this.card_field[cx][cy] = this.cards[i];;
        }
    },

    update_card_pattern:function(){
        for(var x = 0; x < this.width; x++){
            for(var y = 0; y < this.height; y++){

                var target_card = this.card_field[x][y];
                if(target_card == null){
                    continue;
                }

                var empty_point = [[0,0]];
                var side_sum = target_card.number;

                if(x > 0){
                    if(this.card_field[x - 1][y]){
                        side_sum += this.card_field[x - 1][y].number;
                    }else{
                        empty_point.push([-1, 0]);
                    }
                }
                if(y > 0){
                    if(this.card_field[x][y - 1]){
                        side_sum += this.card_field[x][y - 1].number;
                    }else{
                        empty_point.push([0, -1]);
                    }
                }
                if(x < this.width -1){
                    if(this.card_field[x + 1][y]){
                        side_sum += this.card_field[x + 1][y].number;
                    }else{
                        empty_point.push([+1, 0]);
                    }
                }
                if(y < this.height -1){
                    if(this.card_field[x][y + 1]){
                        side_sum += this.card_field[x][y + 1].number;
                    }else{
                        empty_point.push([0, +1]);
                    }
                }

                target_card.sum_num = side_sum;
                target_card.div_pattern = empty_point;
            }
        }

    },
    update_mouse_cell: function() {
        var mx = Math.floor((mouse_x - this.field_draw_offset_x) / this.grid_w );
        var my = Math.floor((mouse_y - this.field_draw_offset_y) / this.grid_h );
        this.mouse_cell_x = Math.max(0, Math.min(this.width - 1, mx));
        this.mouse_cell_y = Math.max(0, Math.min(this.height - 1, my));
    },
    release_deleted_card: function() {
        var l = [];
        for(var i in this.cards){
            if(this.cards[i].delete == false){
                l.push(this.cards[i]);
            }
        }
        this.cards = l;
    },
    update: function(){
        this.update_mouse_cell();
        this.update_card_field_map();
        this.update_card_pattern();

        for(var i in this.cards){
            this.cards[i].update();
        }

        var target_card = this.card_field[this.mouse_cell_x][this.mouse_cell_y];
        if(mouse_l == 1 && target_card) {
            //divide
            var empty_point = [];
            if(this.mouse_cell_x > 0 && this.card_field[this.mouse_cell_x - 1][this.mouse_cell_y] == null){
                empty_point.push([-1, 0]);
            }
            if(this.mouse_cell_y > 0 && this.card_field[this.mouse_cell_x][this.mouse_cell_y - 1] == null){
                empty_point.push([0, -1]);
            }
            if(this.mouse_cell_x < this.width - 1 && this.card_field[this.mouse_cell_x + 1][this.mouse_cell_y] == null){
                empty_point.push([+1, 0]);
            }
            if(this.mouse_cell_y < this.height - 1 && this.card_field[this.mouse_cell_x][this.mouse_cell_y + 1] == null){
                empty_point.push([0, +1]);
            }

            console.log(target_card.number, empty_point);
            if(empty_point.length > 0 && target_card.number / (empty_point.length + 1) >= 1) {
                //dividable
                var divided_num = Math.floor(target_card.number / (empty_point.length + 1));
                var center_num = divided_num + target_card.number % (empty_point.length + 1);
                //var divided_num = Math.floor(target_card.number / (empty_point.length));
                //var center_num = target_card.number % (empty_point.length);
                target_card.number = center_num;

                for(var n in empty_point){
                    var card = new c_card();
                    card.px = target_card.px + empty_point[n][0];
                    card.py = target_card.py + empty_point[n][1];
                    card.trend_px = target_card.px;
                    card.trend_py = target_card.py;
                    card.number = divided_num;
                    this.cards.push(card);
                }

                var out_string = "<li>(" + target_card.px.toString() + "," + target_card.py.toString() + ") div </li>";
                $("#game_record").append(out_string);
            }

        }

        if(mouse_r == 1 && target_card) {
            var side_cards = [];
            if(this.mouse_cell_x > 0 && this.card_field[this.mouse_cell_x - 1][this.mouse_cell_y]){
                side_cards.push(this.card_field[this.mouse_cell_x - 1][this.mouse_cell_y]);
            }
            if(this.mouse_cell_y > 0 && this.card_field[this.mouse_cell_x][this.mouse_cell_y - 1]){
                side_cards.push(this.card_field[this.mouse_cell_x][this.mouse_cell_y -1]);
            }
            if(this.mouse_cell_x < this.width - 1 && this.card_field[this.mouse_cell_x + 1][this.mouse_cell_y]){
                side_cards.push(this.card_field[this.mouse_cell_x + 1][this.mouse_cell_y]);
            }
            if(this.mouse_cell_y < this.height - 1 && this.card_field[this.mouse_cell_x][this.mouse_cell_y + 1]){
                side_cards.push(this.card_field[this.mouse_cell_x][this.mouse_cell_y +1]);
            }

            for(var n in side_cards){
                var card = side_cards[n];
                card.px = target_card.px;
                card.py = target_card.py;
                card.delete =true;
                target_card.number += card.number;
                target_card.child_cards.push(card);
            }
            if(side_cards.length > 0){
                var out_string = "<li>(" + target_card.px.toString() + "," + target_card.py.toString() + ") sum</li>";
                $("#game_record").append(out_string);
            }
        }

        this.release_deleted_card();
    },
    draw: function(canvas){

        // BG
        canvas.drawRect({
            fillStyle: 'rgba(22, 200, 80, 0.1)',
            x: this.field_draw_offset_x,
            y: this.field_draw_offset_y,
            width: this.grid_w * this.width,
            height: this.grid_h * this.height,
            fromCenter: false
        });

        for (var x = 0 ; x < this.width ; x++){
            for (var y = 0 ; y < this.height ; y++){
                canvas.drawRect({
                    fillStyle: 'rgba(20, 20, 20, 0.1)',
                    x: this.field_draw_offset_x + x * this.grid_w + 5,
                    y: this.field_draw_offset_y + y * this.grid_h + 5,
                    width: this.grid_w - 10,
                    height: this.grid_h - 10,
                    fromCenter: false
                });
            }
        }

        for(i in this.cards){
            this.cards[i].draw(canvas, this.grid_w, this.grid_h, this.field_draw_offset_x, this.field_draw_offset_y);
        }

        // cursor
        canvas.drawRect({
            strokeStyle: 'rgba(255, 255, 255, 0.1)',
            strokeWidth: 5,
            x: this.mouse_cell_x * this.grid_w + this.field_draw_offset_x,
            y: this.mouse_cell_y * this.grid_h + this.field_draw_offset_y,
            width: this.grid_w,
            height: this.grid_h,
            fromCenter: false
        });


    }

};


var c_card = function() {
    this.px = 0;
    this.py = 0;
    this.trend_px = 0;
    this.trend_py = 0;
    this.number = 0;
    this.effect_counter = 0;
    this.elace_counter = 0;
    this.delete = false;
    this.child_cards = [];

    this.div_pattern = [];
    this.sum_num = 0;
};

c_card.prototype = {
    draw: function(canvas, grid_w, grid_h, offset_x, offset_y){
        //console.log(this.trend_px * grid_w + offset_x);
        for(var i in this.child_cards){
            var card = this.child_cards[i];
            card.draw(canvas, grid_w, grid_h, offset_x, offset_y);
        }


        var card_color = "rgba(255, 255, 200, 0.8)";
        if (this.effect_counter){
            card_color = "rgba(255, 255, 200, 0.2)";
        }

        canvas.drawRect({
            fillStyle: card_color,
            x: this.trend_px * grid_w + offset_x + 7,
            y: this.trend_py * grid_h + offset_y + 7,
            width: grid_w - 14,
            height: grid_h - 14,
            fromCenter: false
        });

        var number_color = "rgba(10, 10, 10, 0.8)";
        if(this.elace_counter){
            number_color = "rgba(255, 10, 10, 1)";
        }
        canvas.drawText({
            fillStyle: number_color,
            x: this.trend_px * grid_w + offset_x + grid_w / 2,
            y: this.trend_py * grid_h + offset_y + grid_h * 2/ 5,
            fontSize: grid_h * 0.4,
            text: this.number.toString()
        })

        // total
        var sum_number_color = "rgba(10, 10, 10, 0.8)";
        if(this.sum_num==10){
            sum_number_color = "rgba(255, 10, 10, 1)";
        }

        canvas.drawText({
            fillStyle: sum_number_color,
            x: this.trend_px * grid_w + offset_x + grid_w * 5/ 6,
            y: this.trend_py * grid_h + offset_y + grid_h * 5/ 6,
            fontSize: grid_h * 0.2,
            text: this.sum_num.toString()
        });



        //div pattern
        if (this.div_pattern.length > 1){
            var divided_num = Math.floor(this.number / (this.div_pattern.length));
            var center_num = divided_num + this.number % (this.div_pattern.length);
            //var divided_num = Math.floor(this.number / (this.div_pattern.length -1));
            //var center_num = this.number % (this.div_pattern.length - 1);
            for(var i in this.div_pattern){
                var point = this.div_pattern[i];
                var x = point[0];
                var y = point[1];
                var num = divided_num;

                if(num == 0){
                    continue;
                }

                if (x == 0 && y == 0){
                    num = center_num;
                }

                var div_number_color = "rgba(10, 10, 10, 0.8)";
                if(num==10){
                    div_number_color = "rgba(255, 10, 10, 1)";
                }

                canvas.drawText({
                    fillStyle: div_number_color,
                    x: this.trend_px * grid_w + offset_x + grid_w * 2/ 10 + x * grid_w * 1.0 / 10,
                    y: this.trend_py * grid_h + offset_y + grid_h * 8/ 10 + y * grid_h * 1.0 / 10,
                    fontSize: grid_h * 0.1,
                    text: num.toString()
                });
            }
        }


    },
    update: function(){
        var mix_rate = 0.9;
        this.trend_px = this.trend_px * mix_rate + this.px * (1 - mix_rate);
        this.trend_py = this.trend_py * mix_rate + this.py * (1 - mix_rate);

        var child_cards = [];
        for(var i in this.child_cards){
            var card = this.child_cards[i];
            card.update();
            if(card.effect_counter == 30){
                //this.number += card.number;
            } else {
                card.effect_counter += 1;
                child_cards.push(card);
            }
        }
        this.child_cards = child_cards;

        if(this.number == 10) {
            this.elace_counter += 1;
            if(this.elace_counter == 60){
                this.delete = true;
            }
        } else {
            this.elace_counter = 0;
        }
    }
};

function draw_mouse_cursor(canvas)
{
    var radius = 10;
    var color =  "rgba(255, 255, 255, 0.8)";
    if(mouse_l) color = "rgba(255, 128, 128, 0.8)";
    if(mouse_r) color = "rgba(128, 255, 128, 0.8)";


    canvas.drawArc({
        fillStyle: color,
        x: mouse_x,
        y: mouse_y,
        radius: radius
    });

    /*
     canvas.drawLine({
     strokeStyle: color,
     strokeWidth: radius,
     rounded: true,
     x1: mouse_last_x,
     y1: mouse_last_y,
     x2: mouse_x,
     y2: mouse_y
     });
     */

}

function draw_demo(canvas)
{
    var sx = (time_counter % 1000).toString();
    while(sx.length < 3) {sx = "0" + sx;}

    var rad = time_counter / 100.0;

    canvas.drawArc({
        fillStyle: "#"+sx,
        x: Math.cos(rad) * 100 + 200,
        y: Math.sin(rad) * 100 + 200,
        radius: (50 + Math.sin(time_counter/20) * 20)
    });
}

function draw(canvas)
{
    // clear
    canvas.drawRect({
        fillStyle: "rgba(10, 10, 10, 0.1)",
        x: 0,
        y: 0,
        width: canvas_width,
        height: canvas_height,
        fromCenter: false
    });

    field.draw(canvas);
    //draw_demo(canvas);
    draw_mouse_cursor(canvas);

    fps_drawer.draw(canvas);
}

function update()
{
    field.update();
}

function update_mouse_status()
{
    var reset_l = function(){
        if(mouse_l > 0) {
            mouse_l = -1;
        } else if (mouse_l == -1) {
            mouse_l = 0
        }
    }

    var reset_r = function(){
        if(mouse_r > 0) {
            mouse_r = -1;
        } else if (mouse_r == -1) {
            mouse_r = 0
        }
    }

    if(mouse_button == 1){
        mouse_l += 1;
        reset_r();
    }

    if(mouse_button == 3){
        mouse_r += 1;
        reset_l();
    }

    if(mouse_button == 0){
        reset_l();
        reset_r();
    }
}

function main_loop()
{
    var canvas = $("#divsum_canvas");

    update_mouse_status();

    update();
    draw(canvas);

    time_counter += 1;
}


function update_mouse_pos(e)
{
    mouse_last_x = mouse_x;
    mouse_last_y = mouse_y;
    mouse_x = e.offsetX;
    mouse_y = e.offsetY;

    //console.log(e.which, e.button, e.buttons);

    if(e.buttons === undefined) {
        // chrome
        mouse_button = e.which;
    } else {
        // mozilla
        if(e.buttons & 1) {
            mouse_button = 1;
        }else if(e.buttons & 2) {
            mouse_button = 3;
        } else {
            mouse_button = 0;
        }
    }
}

var canvas_width = 100;
var canvas_height = 100;

var fps_drawer = new c_fps_drawer();
var field = new c_field();
var time_counter = 0;
var mouse_last_x = 0;
var mouse_last_y = 0;
var mouse_x = 0;
var mouse_y = 0;
var mouse_l = 0;
var mouse_r = 0;
var mouse_button = 0;


$(document).ready(function(){
    var canvas = $("#divsum_canvas");
    canvas.mousemove(update_mouse_pos);
    canvas.mousedown(update_mouse_pos);
    canvas.mouseup(update_mouse_pos);

    canvas_width = parseInt(canvas.css("width"));
    canvas_height = parseInt(canvas.css("height"));

    $(document).bind("contextmenu",function(e){
        return false;
    });

    field.init();

    setInterval(main_loop, 16);
});


window.onhashchange = function(){
    field = new c_field();
    field.init();
};
