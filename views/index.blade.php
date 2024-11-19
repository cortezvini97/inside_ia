@extends('layouts.app')

@section('title', "Inside IA")

@section("styles")
    @encore_entry_link_tags('app')
@endsection

@section('content')
    <div id="content"></div>
@endsection

@section("scripts")
    @encore_entry_script_tags('app')
@endsection
