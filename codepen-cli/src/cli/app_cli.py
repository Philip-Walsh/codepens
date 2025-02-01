"""Contains the Options Arguments and Commands for the CLI"""
import click

@click.group()
def cli():
    "Click CLI for managing CodePens"

@cli.command(name="get-collection")
@click.argument("collection_name")
def get_collection(collection_name):
    "Gets all CodePens in a collection"
    click.echo(f"Fetching all CodePens in collection: {collection_name}")

@cli.command(name="get-codepen")
@click.argument("codepen_id")
def get_codepen(codepen_id):
    "Gets a CodePen by ID"
    click.echo(f"Fetching CodePen with ID: {codepen_id}")

cli.add_command(get_collection)
cli.add_command(get_codepen)
